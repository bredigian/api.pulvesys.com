import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Sesion, Usuario } from '@prisma/client';
import { UUID, randomUUID } from 'node:crypto';

import { DateTime } from 'luxon';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Tokens } from 'src/types/auth.types';

@Injectable()
export class SesionesService {
  private MAX_CONCURRENT_SESIONES = 3;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getSesionByToken(access_token: Sesion['access_token']) {
    return await this.prisma.sesion.findUnique({
      where: { access_token },
      include: {
        usuario: {
          select: {
            nombre_usuario: true,
            nombre: true,
            apellido: true,
            rol: true,
            empresa_id: true,
          },
        },
      },
    });
  }

  async createSesion(
    access_token: Sesion['access_token'],
    refresh_token: UUID,
    usuario_id: Sesion['usuario_id'],
  ) {
    const expireIn = DateTime.now().plus({ days: 7 }).toUTC().toISO();

    return await this.prisma.sesion.create({
      data: {
        access_token,
        refresh_token,
        usuario_id,
        expireIn,
      },
    });
  }

  async deleteSesionByRefreshToken(refresh_token: Sesion['refresh_token']) {
    return await this.prisma.sesion.delete({ where: { refresh_token } });
  }

  async deleteSessionByAccessToken(access_token: Sesion['access_token']) {
    return await this.prisma.sesion.delete({
      where: { access_token },
    });
  }

  getMaxConcurrentSesionesValue() {
    return this.MAX_CONCURRENT_SESIONES;
  }

  async verifySesionesByUserId(id: Usuario['id']) {
    const sessionsQuantity = await this.prisma.sesion.count({
      where: { usuario_id: id },
    });
    if (sessionsQuantity < 3) return true;

    return false;
  }

  async clearExpiredSesiones(id: Usuario['id']) {
    await this.prisma.sesion.deleteMany({
      where: {
        usuario_id: id,
        expireIn: { lte: DateTime.now().toUTC().toJSDate() },
      },
    });
  }

  async refreshTokens(refresh_token: Sesion['refresh_token']): Promise<Tokens> {
    const session = await this.prisma.sesion.findUnique({
      where: { refresh_token },
    });
    if (!session)
      throw new NotFoundException(
        'No se encontró la sesión con el token de refresco enviado.',
      );

    const isExpired = new Date(session.expireIn).getTime() < Date.now();
    if (isExpired) {
      await this.deleteSesionByRefreshToken(refresh_token);
      throw new UnauthorizedException('La sesión ha vencido.');
    }

    const updated_access_token = await this.jwtService.signAsync({
      sub: session.usuario_id,
    });
    const updated_refresh_token = randomUUID();
    const expireIn = DateTime.now().plus({ days: 7 }).toUTC().toISO();
    const updatedSession = await this.prisma.sesion.update({
      where: { id: session.id },
      data: {
        access_token: updated_access_token,
        refresh_token: updated_refresh_token,
        expireIn,
      },
    });

    return {
      access_token: updatedSession.access_token,
      refresh_token: updatedSession.refresh_token as UUID,
      expireIn: updatedSession.expireIn,
    };
  }
}
