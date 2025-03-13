import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UUID } from 'crypto';
import { Pulverizacion, Usuario } from '@prisma/client';

@Injectable()
export class PulverizacionesService {
  constructor(private prisma: PrismaService) {}

  async getPulverizaciones(usuario_id: Usuario['id']) {
    return await this.prisma.pulverizacion.findMany({
      where: { usuario_id },
      include: {
        detalle: {
          include: {
            campo: { include: { Lote: true } },
            cultivo: true,
            tratamiento: true,
          },
        },
        Aplicacion: { include: { producto: true } },
        ConsumoProducto: true,
        productos: true,
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async getById(id: UUID, usuario_id: Usuario['id']) {
    return await this.prisma.pulverizacion.findUnique({
      where: { id, usuario_id },
      include: {
        detalle: {
          include: {
            campo: { include: { Lote: { include: { Coordinada: true } } } },
            cultivo: true,
            tratamiento: true,
          },
        },
        Aplicacion: { include: { producto: true } },
        ConsumoProducto: true,
        productos: true,
      },
    });
  }

  async createPulverizacion(data: Pulverizacion) {
    return await this.prisma.pulverizacion.create({ data });
  }

  async deleteById(id: UUID, usuario_id: Usuario['id']) {
    return await this.prisma.pulverizacion.delete({
      where: { id, usuario_id },
    });
  }
}
