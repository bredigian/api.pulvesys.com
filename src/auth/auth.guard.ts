import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { isUUID } from 'class-validator';
import { Request, Response } from 'express';
import { SesionesService } from 'src/sesiones/sesiones.service';
import { Tokens } from 'src/types/auth.types';
import { Hostname, TEnvironment } from 'src/types/environment.types';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger('AuthGuard Logger');

  constructor(
    private jwtService: JwtService,
    private sesionesService: SesionesService,
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

    const ENVIRONMENT = process.env.NODE_ENV as TEnvironment;
    const domain = Hostname[ENVIRONMENT];

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
    response.cookie('userdata', JSON.stringify(storedSession.usuario), {
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
