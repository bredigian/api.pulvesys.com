import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { SesionesService } from 'src/sesiones/sesiones.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private sesionesService: SesionesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token)
      throw new UnauthorizedException('No tienes los permisos necesarios.');
    try {
      const storedAccessToken =
        await this.sesionesService.findAccessToken(token);
      if (!storedAccessToken)
        throw new UnauthorizedException('No tienes los permisos necesarios.');

      await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException(
        'El token recibido es inválido o ya caducó.',
      );
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    if (!request?.headers?.authorization) return undefined;

    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
