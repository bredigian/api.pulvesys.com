import { Aplicacion } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AplicacionesService {
  constructor(private prisma: PrismaService) {}

  async createAplicacion(data: Aplicacion) {
    return await this.prisma.aplicacion.create({ data });
  }

  async editAplicacion(data: Aplicacion) {
    return await this.prisma.aplicacion.update({
      where: { id: data.id },
      data: {
        dosis: data.dosis,
      },
    });
  }
}
