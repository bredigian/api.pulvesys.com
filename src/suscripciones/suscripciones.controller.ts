import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Version,
} from '@nestjs/common';
import { SuscripcionesService } from './suscripciones.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { MercadopagoService } from 'src/mercadopago/mercadopago.service';
import { Response } from 'express';
import { PlanesService } from 'src/planes/planes.service';
import {
  MPNotification,
  PayloadForInitPoint,
} from 'src/types/mercadopago.types';
import { SuscripcionDTO } from './suscripcion.dto';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { STATUS, Suscripcion } from '@prisma/client';
import { DateTime } from 'luxon';

@Controller('suscripciones')
export class SuscripcionesController {
  constructor(
    private readonly service: SuscripcionesService,
    private readonly mercadopago: MercadopagoService,
    private readonly planesService: PlanesService,
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('mercadopago')
  @Version('1')
  @HttpCode(HttpStatus.NO_CONTENT)
  async getNotifications(@Body() notification: MPNotification) {
    const { type, data } = notification;

    if (type === 'subscription_preapproval') {
      const preapproval = await this.mercadopago.getPreapproval(data.id);
      const {
        id,
        status,
        external_reference: usuario_id,
        next_payment_date,
        payment_method_id,
      } = preapproval;

      const STATUS = status as STATUS;

      if (STATUS === 'pending') return;

      const paymentMethodFailure =
        STATUS === 'cancelled' &&
        payment_method_id !== null &&
        payment_method_id !== 'account_money'
          ? true
          : false;

      const actualSuscripcion = await this.service.getByUsuarioId(usuario_id);

      const monthHasPast =
        DateTime.fromJSDate(actualSuscripcion.createdAt).diffNow('months')
          .months *
          -1 >
        1
          ? true
          : false;

      // Si el usuario cancela desde Mercado Pago, y la suscripcion está
      // en vigencia, status tiene que ser 'cancelled', free_trial tiene
      // que ser 'false' y fecha_fin tiene que ser la fecha fin de Mercado Pago.
      const UPDATE_PAYLOAD: Partial<Suscripcion> = {
        id,
        free_trial: monthHasPast ? false : paymentMethodFailure ? true : false,
        usuario_id,
        status: paymentMethodFailure ? 'pending' : STATUS,
        fecha_fin: DateTime.fromISO(next_payment_date).toUTC().toJSDate(),
      };
      await this.service.updateSuscripcion(UPDATE_PAYLOAD);
    }
  }

  @Post()
  @Version('1')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async generateInitPoint(
    @Res() response: Response,
    @Body() payload: SuscripcionDTO,
    @Headers('Authorization') authorization: string,
  ) {
    try {
      const { sub: usuario_id } = await this.jwtService.decode(
        authorization.substring(7),
      );

      const { plan_id, valor_actual } = payload;
      const plan = await this.planesService.getById(plan_id);
      if (!plan)
        throw new NotFoundException('El plan seleccionado no fué encontrado.');

      if (Number(valor_actual) !== plan.valor)
        throw new BadRequestException(
          'El valor del plan seleccionado no es el correcto o está desactualizado.',
        );

      const usuario = await this.usuariosService.findById(usuario_id);

      const PAYLOAD: PayloadForInitPoint = {
        usuario_id,
        plan,
        usuario_email: usuario.email,
      };

      const { init_point } =
        await this.mercadopago.generatePreapproval(PAYLOAD);

      return response.json({ init_point });
    } catch (e) {
      if (e) throw e;

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }
}
