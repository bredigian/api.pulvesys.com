import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Suscripcion } from '@prisma/client';
import { SuscripcionCreation } from 'src/types/suscripciones.types';

@Injectable()
export class SuscripcionesService {
  constructor(private prisma: PrismaService) {}

  async createSuscripcion(data: SuscripcionCreation) {
    return await this.prisma.suscripcion.create({ data });
  }

  async updateSuscripcion(data: Partial<Suscripcion>) {
    return await this.prisma.suscripcion.update({
      where: { usuario_id: data.usuario_id },
      data,
    });
  }

  async getByUsuarioId(usuario_id: Suscripcion['usuario_id']) {
    return await this.prisma.suscripcion.findUnique({ where: { usuario_id } });
  }
}
