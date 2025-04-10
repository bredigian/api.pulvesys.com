import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { DateTime } from 'luxon';
import { JwtService } from '@nestjs/jwt';
import { RecoverTokenService } from './recover-token.service';
import { Request } from 'express';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Injectable()
export class RecoverTokenGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usuariosService: UsuariosService,
    private recoverTokenService: RecoverTokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const { token } = this.extractTokensFromHeader(request);

    if (!token)
      throw new UnauthorizedException('No tienes los permisos necesarios.');

    const storedToken = await this.recoverTokenService.findOne(token);
    if (!storedToken)
      throw new NotFoundException('No se encontró el token recibido.');

    const now = DateTime.now().toMillis();
    const storedExpireIn = DateTime.fromJSDate(
      new Date(storedToken.expireIn),
    ).toMillis();
    if (now > storedExpireIn)
      throw new ForbiddenException('El token ya expiró.');

    try {
      await this.jwtService.verifyAsync(token);

      const { sub, email } = await this.jwtService.decode(token);
      const storedUsuario = await this.usuariosService.findByIdAndEmail(
        sub,
        email,
      );
      if (!storedUsuario)
        throw new NotFoundException('No se encontró al usuario.');

      return true;
    } catch (e) {
      throw new BadRequestException('El token no es válido o ya expiró.');
    }
  }

  private extractTokensFromHeader(
    request: Request,
  ): { token: string } | undefined {
    if (!request?.headers?.authorization) return { token: undefined };

    let [type, token] = request?.headers?.authorization?.split(' ') ?? [];

    token = token.replaceAll('"', '').replaceAll("'", '');

    return type === 'Bearer' ? { token } : { token: undefined };
  }
}
