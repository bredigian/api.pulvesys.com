import { SUBSCRIPTION_MESSAGE, Suscripcion } from '@prisma/client';

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SuscripcionCreation } from 'src/types/suscripciones.types';

@Injectable()
export class SuscripcionesService {
  constructor(private prisma: PrismaService) {}

  async createSuscripcion(data: SuscripcionCreation) {
    return await this.prisma.suscripcion.create({
      data,
      include: { plan: true },
    });
  }

  async updateSuscripcion(
    usuario_id: Suscripcion['usuario_id'],
    data: Partial<Suscripcion>,
  ) {
    return await this.prisma.suscripcion.update({
      where: { usuario_id },
      data,
      include: {
        plan: true,
      },
    });
  }

  async getByUsuarioId(usuario_id: Suscripcion['usuario_id']) {
    return await this.prisma.suscripcion.findUnique({
      where: { usuario_id },
      include: {
        plan: true,
      },
    });
  }

  async updateMessageInfo(
    usuario_id: Suscripcion['usuario_id'],
    value: SUBSCRIPTION_MESSAGE,
  ) {
    return await this.prisma.suscripcion.update({
      where: { usuario_id },
      data: { message_info: value },
    });
  }
}
