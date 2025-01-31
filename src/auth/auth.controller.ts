import { SesionesService } from 'src/sesiones/sesiones.service';
import { AuthDto } from './auth.dto';
import { AuthService } from './auth.service';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  InternalServerErrorException,
  NotFoundException,
  Post,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
  Version,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DateTime } from 'luxon';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly sesionesService: SesionesService,
    private readonly jwtService: JwtService,
  ) {}

  @Version('1')
  @Post('signin')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async signin(@Body() payload: AuthDto) {
    try {
      const { nombre_usuario, contrasena } = payload;
      const exists = await this.service.findByUsername(nombre_usuario);
      if (!exists) throw new BadRequestException('El usuario no existe.');

      const matchPassword = await this.service.verifyPassword(
        contrasena,
        exists.contrasena,
      );
      if (!matchPassword)
        throw new UnauthorizedException('Las credenciales son incorrectas.');

      const { id, nombre, apellido } = exists;

      await this.sesionesService.clearExpiredSesiones(id);

      const canSignin = await this.sesionesService.verifySesionesByUserId(id);
      if (!canSignin)
        throw new ForbiddenException(
          'Se alcanzó el limite de sesiones concurrentes. Puedes iniciar sesión en hasta 3 dispositivos al mismo tiempo.',
        );

      const access_token = await this.jwtService.signAsync({
        sub: id,
        nombre_usuario,
        nombre,
        apellido,
      });

      const session = await this.sesionesService.createSesion(access_token, id);

      return {
        access_token,
        expireIn: session.expireIn,
        userdata: { nombre_usuario, nombre, apellido },
      };
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
  async verifySesion(@Headers('Authorization') authorization: string) {
    try {
      const access_token_from_request = authorization?.substring(7);
      if (!access_token_from_request)
        throw new UnauthorizedException('El token de acceso es requerido.');

      const session = await this.sesionesService.getSesionByToken(
        access_token_from_request,
      );
      if (!session)
        throw new NotFoundException('La sesión no existe o ya expiró.');

      const { access_token, expireIn, usuario } = session;
      if (
        DateTime.fromJSDate(new Date(expireIn)).toMillis() <
        DateTime.now().toMillis()
      ) {
        await this.sesionesService.deleteSesionByToken(access_token);
        throw new UnauthorizedException('La sesión ha expirado.');
      }

      const isValid = await this.jwtService.verifyAsync(access_token);
      if (!isValid) throw new UnauthorizedException('La sesión ha expirado');

      const { nombre, nombre_usuario, apellido } = usuario;

      return {
        access_token: access_token,
        expireIn: expireIn,
        userdata: { nombre_usuario, nombre, apellido },
      };
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
  async signout(@Headers('Authorization') authorization: string) {
    try {
      const access_token = authorization.substring(7);
      return await this.sesionesService.deleteSesionByToken(access_token);
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
