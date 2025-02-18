import { Sesion, Usuario } from '@prisma/client';

import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

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
          select: { nombre_usuario: true, nombre: true, apellido: true },
        },
      },
    });
  }

  async createSesion(
    access_token: Sesion['access_token'],
    usuario_id: Sesion['usuario_id'],
  ) {
    const { exp } = await this.jwtService.decode(access_token);
    const expires_in = DateTime.fromMillis(exp * 1000)
      .toUTC()
      .toISO();

    return await this.prisma.sesion.create({
      data: {
        access_token: access_token,
        usuario_id,
        expireIn: expires_in,
      },
    });
  }

  async deleteSesionByToken(access_token: Sesion['access_token']) {
    return await this.prisma.sesion.delete({ where: { access_token } });
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

  async findAccessToken(access_token: Sesion['access_token']) {
    return await this.prisma.sesion.findUnique({ where: { access_token } });
  }
}
