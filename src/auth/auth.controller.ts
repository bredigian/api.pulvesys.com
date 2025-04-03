import { SesionesService } from 'src/sesiones/sesiones.service';
import { AuthDto, SignupDto } from './auth.dto';
import { AuthService } from './auth.service';
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
  Version,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { Hostname, TEnvironment } from 'src/types/environment.types';
import { HashService } from 'src/lib/hash.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { SuscripcionesService } from 'src/suscripciones/suscripciones.service';
import { DateTime } from 'luxon';
import { PlanesService } from 'src/planes/planes.service';
import { SuscripcionCreation } from 'src/types/suscripciones.types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly sesionesService: SesionesService,
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly hashService: HashService,
    private readonly suscripcionesService: SuscripcionesService,
    private readonly planesService: PlanesService,
  ) {}

  @Version('1')
  @Post('signup')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async signup(@Body() payload: SignupDto, @Res() response: Response) {
    try {
      const { contrasena } = payload;
      const plan = await this.planesService.getById(payload.plan_id);
      if (!plan) throw new NotFoundException('El plan seleccionado no existe.');

      if (plan.nombre === 'ADMIN')
        throw new ForbiddenException('El rol recibido no está habilitado.');

      delete payload.plan_id;

      const hashedPassword = await this.hashService.generateHash(contrasena);
      const createdUser = await this.usuariosService.createUser({
        ...payload,
        rol: plan.nombre,
        contrasena: hashedPassword,
      });

      const { id, nombre, nombre_usuario, apellido, rol } = createdUser;

      const now = DateTime.now();

      // Crear la suscripcion con 30 días de prueba
      const SUSCRIPCION_PAYLOAD: SuscripcionCreation = {
        usuario_id: id,
        plan_id: plan.id,
        free_trial: true,
        status: 'pending',
        message_info: 'welcome',
        fecha_fin: now.toUTC().plus({ days: 30 }).toJSDate(),
      };
      const { free_trial, status, fecha_fin, message_info } =
        await this.suscripcionesService.createSuscripcion(SUSCRIPCION_PAYLOAD);

      const { access_token, refresh_token } =
        await this.authService.generateTokens(id);

      const { expireIn } = await this.sesionesService.createSesion(
        access_token,
        refresh_token,
        id,
      );

      const ENVIRONMENT = process.env.NODE_ENV as TEnvironment;
      const domain = Hostname[ENVIRONMENT];

      response.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: true,
        expires: new Date(expireIn), // 15 dias
        sameSite: 'none',
        domain,
      });
      response.cookie('access_token', access_token, {
        expires: new Date(expireIn), // 15 dias
        domain,
      });
      response.cookie(
        'userdata',
        JSON.stringify({
          nombre_usuario,
          nombre,
          apellido,
          rol,
          isEmployer: false,
          suscripcion: {
            free_trial,
            status,
            next_payment_date: fecha_fin,
            message_info,
          },
        }),
        {
          expires: new Date(expireIn), // 15 dias
          domain,
        },
      );

      return response.json({
        access_token,
        expireIn,
        userdata: {
          nombre_usuario,
          nombre,
          apellido,
          rol,
          isEmployer: false,
          suscripcion: {
            free_trial,
            status,
            next_payment_date: fecha_fin,
            message_info,
          },
        },
      });
    } catch (e) {
      if (e) {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === 'P2002')
            throw new ConflictException('El usuario ya existe.');
          throw e;
        }

        throw e;
      }

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }

  @Version('1')
  @Post('signin')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async signin(@Body() payload: AuthDto, @Res() response: Response) {
    try {
      const { nombre_usuario, contrasena } = payload;
      const exists = await this.usuariosService.findByUsername(nombre_usuario);
      if (!exists) throw new BadRequestException('El usuario no existe.');

      const matchPassword = await this.service.verifyPassword(
        contrasena,
        exists.contrasena,
      );
      if (!matchPassword)
        throw new UnauthorizedException('Las credenciales son incorrectas.');

      const { id, nombre, apellido, rol, empresa_id } = exists;
      const isEmployer = rol === 'INDIVIDUAL' && empresa_id ? true : false;

      const suscripcion = await this.suscripcionesService.getByUsuarioId(
        isEmployer ? empresa_id : id,
      );
      if (!suscripcion)
        throw new NotFoundException(
          'Hay un conflicto con la suscripción del usuario.',
        );

      const { free_trial, message_info, status, fecha_fin } = suscripcion;

      if (status === 'pending') {
        const now = DateTime.now();
        const isFreeTrialExpired =
          now.toMillis() > DateTime.fromJSDate(new Date(fecha_fin)).toMillis();

        if (isFreeTrialExpired)
          await this.suscripcionesService.updateSuscripcion({
            free_trial: false,
            usuario_id: isEmployer ? empresa_id : id,
            message_info: 'warning',
          });
      }

      await this.sesionesService.clearExpiredSesiones(id);

      const canSignin = await this.sesionesService.verifySesionesByUserId(id);
      if (!canSignin)
        throw new ForbiddenException(
          'Se alcanzó el limite de sesiones concurrentes. Puedes iniciar sesión en hasta 3 dispositivos al mismo tiempo.',
        );

      const { access_token, refresh_token } =
        await this.authService.generateTokens(id);

      const { expireIn } = await this.sesionesService.createSesion(
        access_token,
        refresh_token,
        id,
      );

      const ENVIRONMENT = process.env.NODE_ENV as TEnvironment;
      const domain = Hostname[ENVIRONMENT];

      response.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: true,
        expires: new Date(expireIn), // 15 dias
        sameSite: 'none',
        domain,
      });
      response.cookie('access_token', access_token, {
        expires: new Date(expireIn), // 15 dias
        domain,
      });
      response.cookie(
        'userdata',
        JSON.stringify({
          nombre_usuario,
          nombre,
          apellido,
          rol,
          isEmployer,
          suscripcion: {
            free_trial,
            status,
            next_payment_date: fecha_fin,
            message_info,
          },
        }),
        {
          expires: new Date(expireIn), // 15 dias
          domain,
        },
      );

      return response.json({
        access_token,
        expireIn,
        userdata: {
          nombre_usuario,
          nombre,
          apellido,
          rol,
          isEmployer,
          suscripcion: {
            free_trial,
            status,
            next_payment_date: fecha_fin,
            message_info,
          },
        },
      });
    } catch (e) {
      if (e) throw e;

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }

  @Version('1')
  @Get('sesion')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async verifySesion(
    @Headers('Authorization') authorization: string,
    @Headers('Cookie') cookie_refresh_token: string,
    @Res() response: Response,
  ) {
    try {
      const access_token_from_request = authorization
        ?.substring(7)
        .replaceAll("'", '')
        .replaceAll('"', '');
      if (!access_token_from_request)
        throw new UnauthorizedException('El token de acceso es requerido.');

      const session = await this.sesionesService.getSesionByToken(
        access_token_from_request,
      );
      if (!session)
        throw new NotFoundException('La sesión no existe o ya expiró.');

      const { access_token, refresh_token, expireIn, usuario } = session;
      const { id, nombre, nombre_usuario, apellido, empresa_id, rol } = usuario;

      const isEmployer = rol === 'INDIVIDUAL' && empresa_id ? true : false;

      const suscripcion = await this.suscripcionesService.getByUsuarioId(
        isEmployer ? empresa_id : id,
      );
      if (!suscripcion)
        throw new NotFoundException(
          'No se encontró la suscripción del usuario en el sistema.',
        );

      const { free_trial, status, message_info, fecha_fin } = suscripcion;

      if (status === 'pending') {
        const now = DateTime.now();
        const isFreeTrialExpired =
          now.toMillis() > DateTime.fromJSDate(new Date(fecha_fin)).toMillis();

        if (isFreeTrialExpired)
          await this.suscripcionesService.updateSuscripcion({
            free_trial: false,
            usuario_id: isEmployer ? empresa_id : id,
            message_info: 'warning',
          });
      }

      let updatedAccessToken = access_token;
      let updatedRefreshToken = refresh_token;
      let updatedExpireIn: Date | string = expireIn;

      try {
        await this.jwtService.verifyAsync(access_token);
      } catch (e) {
        if (e) {
          let { value: refresh_token_from_cookie } =
            JSON.parse(cookie_refresh_token);
          refresh_token_from_cookie = refresh_token_from_cookie
            .replaceAll("'", '')
            .replaceAll('"', '');

          if (!refresh_token)
            throw new UnauthorizedException(
              'El token de refresco es requerido.',
            );

          const {
            access_token: updated_access_token,
            refresh_token: updated_refresh_token,
            expireIn: updated_expire_in,
          } = await this.sesionesService.refreshTokens(
            refresh_token_from_cookie,
          );

          updatedAccessToken = updated_access_token;
          updatedRefreshToken = updated_refresh_token;
          updatedExpireIn = updated_expire_in;
        }
      }

      const ENVIRONMENT = process.env.NODE_ENV as TEnvironment;
      const domain = Hostname[ENVIRONMENT];

      return response.json({
        access_token: updatedAccessToken,
        refresh_token: updatedRefreshToken,
        expireIn: updatedExpireIn,
        userdata: {
          nombre_usuario,
          nombre,
          apellido,
          rol,
          isEmployer,
          suscripcion: {
            free_trial,
            status,
            next_payment_date: fecha_fin,
            message_info,
          },
        },
        domain,
      });
    } catch (e) {
      if (e) {
        console.error(e);
        throw e;
      }

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }

  @Version('1')
  @Delete('sesion')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async signout(
    @Req() request: Request,
    @Res() response: Response,
    @Headers('Authorization') authorization: string,
  ) {
    try {
      const access_token = authorization
        .substring(7)
        ?.replaceAll("'", '')
        .replaceAll('"', '');
      const refresh_token = request.cookies['refresh_token']
        ?.replaceAll("'", '')
        .replaceAll('"', '');
      if (!access_token || !refresh_token)
        throw new UnauthorizedException(
          'Los tokens de autenticación son requeridos.',
        );
      const deletedSession =
        await this.sesionesService.deleteSessionByAccessToken(access_token);

      response.clearCookie('access_token');
      response.clearCookie('refresh_token');
      response.clearCookie('userdata');

      return response.json(deletedSession);
    } catch (e) {
      if (e) {
        console.error(e);
        throw e;
      }

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }
}
