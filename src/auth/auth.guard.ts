import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Hostname, TEnvironment } from 'src/types/environment.types';
import { Request, Response } from 'express';

import { DateTime } from 'luxon';
import { JwtService } from '@nestjs/jwt';
import { MercadopagoService } from 'src/mercadopago/mercadopago.service';
import { STATUS } from '@prisma/client';
import { SesionesService } from 'src/sesiones/sesiones.service';
import { SuscripcionesService } from 'src/suscripciones/suscripciones.service';
import { Tokens } from 'src/types/auth.types';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { isUUID } from 'class-validator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private sesionesService: SesionesService,
    private usuariosService: UsuariosService,
    private suscripcionesService: SuscripcionesService,
    private mercadopago: MercadopagoService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const { access_token, refresh_token } =
      this.extractTokensFromHeader(request);

    if (!refresh_token || !access_token)
      throw new UnauthorizedException('No tienes los permisos necesarios.');

    const response: Response = context.switchToHttp().getResponse();

    const storedSession =
      await this.sesionesService.getSesionByToken(access_token);
    if (!storedSession)
      throw new UnauthorizedException(
        'El token no es válido o la sesión ya venció.',
      );

    let updatedAccessToken = storedSession.access_token;
    let updatedRefreshToken = storedSession.refresh_token;
    let updatedExpireIn = storedSession.expireIn;

    try {
      await this.jwtService.verifyAsync(access_token);
    } catch (e) {
      const {
        access_token: updated_access_token,
        refresh_token: updated_refresh_token,
        expireIn: updated_expire_in,
      } = await this.sesionesService.refreshTokens(refresh_token);

      updatedAccessToken = updated_access_token;
      updatedRefreshToken = updated_refresh_token;
      updatedExpireIn = new Date(updated_expire_in);
    }

    const { sub: usuario_id } = await this.jwtService.decode(access_token);

    const { empresa_id, rol } = await this.usuariosService.findById(usuario_id);

    const isEmployer = rol === 'INDIVIDUAL' && empresa_id ? true : false;

    let suscripcion = await this.suscripcionesService.getByUsuarioId(
      isEmployer ? empresa_id : usuario_id,
    );
    if (!suscripcion) {
      throw new UnauthorizedException(
        'No se encontró la suscripción del usuario en el sistema.',
      );
    }

    const endDateFromDb = new Date(suscripcion.fecha_fin);

    const now = DateTime.now();

    if (rol !== 'ADMIN') {
      if (suscripcion.status === 'pending') {
        const isFreeTrialExpired =
          now.toMillis() > DateTime.fromJSDate(endDateFromDb).toMillis();

        if (isFreeTrialExpired)
          suscripcion = await this.suscripcionesService.updateSuscripcion(
            isEmployer ? empresa_id : usuario_id,
            {
              free_trial: false,
              message_info: 'warning',
            },
          );
      }
    } else
      suscripcion = await this.suscripcionesService.updateSuscripcion(
        usuario_id,
        {
          fecha_fin: now.plus({ years: 1 }).toUTC().toJSDate(),
        },
      );
    const ENVIRONMENT = process.env.NODE_ENV as TEnvironment;
    const domain = Hostname[ENVIRONMENT];

    if (rol !== 'ADMIN' && suscripcion.id) {
      const preapproval = await this.mercadopago.getPreapproval(suscripcion.id);
      if (!preapproval)
        throw new UnauthorizedException(
          'No se encontró la suscripción del usuario en Mercado Pago.',
        );

      const { status, next_payment_date, summarized: extra } = preapproval;

      // Si status de MP es "paused" y en la BD tiene un valor distinto, lo actualizamos.
      if (status === 'paused' && suscripcion.status !== 'paused')
        suscripcion = await this.suscripcionesService.updateSuscripcion(
          isEmployer ? empresa_id : suscripcion.id,
          { status: 'paused', message_info: 'paused' },
        );

      const endDateFromMP = new Date(next_payment_date);

      // Si por algún motivo el webhook de MP falla y no actualiza la DB
      // y los datos de la DB no coinciden con MP, actualiza la DB

      if (
        status !== suscripcion.status ||
        endDateFromMP.getTime() !== endDateFromDb.getTime()
      )
        await this.suscripcionesService.updateSuscripcion(
          isEmployer ? empresa_id : usuario_id,
          {
            status: status as STATUS,
            fecha_fin: new Date(next_payment_date),
          },
        );

      response.cookie(
        'userdata',
        JSON.stringify({
          ...storedSession.usuario,
          suscripcion: {
            free_trial: suscripcion.free_trial,
            status,
            next_payment_date,
            message_info: suscripcion.message_info,
            plan: {
              id: suscripcion.plan.id,
              valor_actual: suscripcion.plan.valor,
            },
            extra,
          },
        }),
        {
          expires: updatedExpireIn,
          domain,
        },
      );
    } else {
      response.cookie(
        'userdata',
        JSON.stringify({
          ...storedSession.usuario,
          suscripcion: {
            free_trial: suscripcion.free_trial,
            status: suscripcion.status,
            next_payment_date:
              rol === 'ADMIN'
                ? now.plus({ years: 1 }).toUTC().toJSDate()
                : suscripcion.fecha_fin,
            message_info: suscripcion.message_info,
            plan: {
              id: suscripcion.plan.id,
              valor_actual: suscripcion.plan.valor,
            },
          },
        }),
        {
          expires: updatedExpireIn,
          domain,
        },
      );
    }

    response.cookie('refresh_token', updatedRefreshToken, {
      httpOnly: true,
      secure: true,
      expires: updatedExpireIn,
      sameSite: 'none',
      domain,
    });
    response.cookie('access_token', updatedAccessToken, {
      expires: updatedExpireIn,
      domain,
    });

    return true;
  }

  private extractTokensFromHeader(request: Request): Tokens | undefined {
    if (!request?.headers?.authorization || !request?.headers?.cookie)
      return { access_token: undefined, refresh_token: undefined };

    let [type, access_token] =
      request?.headers?.authorization?.split(' ') ?? [];
    let refresh_token =
      request?.cookies['refresh_token'] ?? // request.cookies["COOKIE_NAME"] para las mutation requests ;
      JSON?.parse(request?.headers?.cookie)?.value;

    access_token = access_token.replaceAll('"', '').replaceAll("'", '');
    refresh_token = refresh_token.replaceAll('"', '').replaceAll("'", '');

    return type === 'Bearer' && isUUID(refresh_token)
      ? { access_token, refresh_token }
      : { access_token: undefined, refresh_token: undefined };
  }
}
