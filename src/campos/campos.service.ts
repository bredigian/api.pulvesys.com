import { Campo } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UUID } from 'crypto';

@Injectable()
export class CamposService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return await this.prisma.campo.findMany({
      include: { Lote: { include: { Coordinada: true } } },
    });
  }

  async addCampo(data: Campo) {
    return await this.prisma.campo.create({ data });
  }

  async findById(id: UUID) {
    return await this.prisma.campo.findUnique({
      where: { id },
      include: { Lote: true },
    });
  }

  async editCampo(data: Campo) {
    return await this.prisma.campo.update({ where: { id: data.id }, data });
  }

  async deleteById(id: UUID) {
    return await this.prisma.campo.delete({ where: { id } });
  }
}
