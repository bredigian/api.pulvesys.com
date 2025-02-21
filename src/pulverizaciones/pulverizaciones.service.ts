import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PulverizacionBaseDTO } from './pulverizaciones.dto';
import { UUID } from 'crypto';

@Injectable()
export class PulverizacionesService {
  constructor(private prisma: PrismaService) {}

  async getPulverizaciones() {
    return await this.prisma.pulverizacion.findMany({
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

  async getById(id: UUID) {
    return await this.prisma.pulverizacion.findUnique({
      where: { id },
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

  async createPulverizacion(data: PulverizacionBaseDTO) {
    return await this.prisma.pulverizacion.create({ data });
  }

  async deleteById(id: UUID) {
    return await this.prisma.pulverizacion.delete({ where: { id } });
  }
}
