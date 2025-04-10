import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Patch,
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
import { MessageInfoDTO, SuscripcionDTO } from './suscripcion.dto';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { STATUS, Suscripcion } from '@prisma/client';
import { DateTime } from 'luxon';
import { LogSuscripcionesService } from 'src/log-suscripciones/log-suscripciones.service';

@Controller('suscripciones')
export class SuscripcionesController {
  private readonly logger = new Logger(SuscripcionesController.name);

  constructor(
    private readonly service: SuscripcionesService,
    private readonly logSuscripcionesService: LogSuscripcionesService,
    private readonly mercadopago: MercadopagoService,
    private readonly planesService: PlanesService,
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  @Version('1')
  @UseGuards(AuthGuard)
  async getSuscripcion(
    @Res() response: Response,
    @Headers('Authorization') authorization: string,
  ) {
    try {
      const { sub: usuario_id } = await this.jwtService.decode(
        authorization.substring(7),
      );

      const suscripcion = await this.service.getByUsuarioId(usuario_id);
      if (!suscripcion)
        throw new NotFoundException(
          'No se encontró la suscripción para el usuario.',
        );

      if (!suscripcion.id) return response.json(suscripcion);

      const { id } = suscripcion;
      const { summarized } = await this.mercadopago.getPreapproval(id);

      return response.json({ ...suscripcion, extra: summarized });
    } catch (e) {
      if (e) throw e;

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }

  @Post('mercadopago')
  @Version('1')
  @HttpCode(HttpStatus.NO_CONTENT)
  async getNotifications(@Body() notification: MPNotification) {
    const { type, data } = notification;

    this.logger.debug(notification);

    if (type === 'subscription_preapproval') {
      const preapproval = await this.mercadopago.getPreapproval(data.id);
      const {
        id,
        status,
        external_reference: usuario_id,
        next_payment_date,
        payment_method_id,
        summarized,
        auto_recurring,
      } = preapproval;

      this.logger.debug(preapproval);

      const STATUS = status as STATUS;

      if (STATUS === 'pending') return;

      const paymentMethodFailure =
        STATUS === 'cancelled' &&
        payment_method_id !== null &&
        payment_method_id !== 'account_money'
          ? true
          : false;

      const { semaphore } = summarized;

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
        status: paymentMethodFailure
          ? 'pending'
          : semaphore === 'red' && STATUS !== 'cancelled'
            ? 'paused'
            : STATUS,
        fecha_fin: DateTime.fromISO(next_payment_date).toUTC().toJSDate(),
        message_info: paymentMethodFailure
          ? 'disabled'
          : semaphore === 'yellow' && STATUS === 'authorized'
            ? 'payment_warning'
            : STATUS === 'cancelled'
              ? 'cancelled'
              : STATUS === 'paused'
                ? 'paused'
                : 'disabled',
      };
      await this.service.updateSuscripcion(usuario_id, UPDATE_PAYLOAD);

      await this.logSuscripcionesService.createLog({
        usuario_id,
        fecha: DateTime.now().toUTC().toJSDate(),
        monto: auto_recurring.transaction_amount,
      });
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

  @Patch('mensaje')
  @Version('1')
  @UseGuards(AuthGuard)
  async updateMessageInfo(
    @Res() response: Response,
    @Body() data: MessageInfoDTO,
    @Headers('Authorization') authorization: string,
  ) {
    try {
      const { sub: usuario_id } = await this.jwtService.decode(
        authorization.substring(7),
      );

      const updated = await this.service.updateMessageInfo(
        usuario_id,
        data.message_info,
      );

      return response.json(updated);
    } catch (e) {
      if (e) throw e;

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }

  @Delete()
  @Version('1')
  @UseGuards(AuthGuard)
  async unsuscribe(
    @Res() response: Response,
    @Headers('Authorization') authorization: string,
  ) {
    try {
      const { sub: usuario_id } = await this.jwtService.decode(
        authorization.substring(7),
      );

      const suscripcion = await this.service.getByUsuarioId(usuario_id);
      if (!suscripcion)
        throw new NotFoundException(
          'No se encontró la suscripción para el usuario.',
        );

      const { id } = suscripcion;

      await this.mercadopago.unsuscribe(id);

      return response.json({ ok: true });
    } catch (e) {
      if (e) throw e;

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }
}
