import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TipoTratamiento } from '@prisma/client';
import { UUID } from 'crypto';

@Injectable()
export class TratamientosService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return await this.prisma.tipoTratamiento.findMany();
  }

  async addTratamiento(data: TipoTratamiento) {
    return await this.prisma.tipoTratamiento.create({ data });
  }

  async findById(id: UUID) {
    return await this.prisma.tipoTratamiento.findUnique({ where: { id } });
  }

  async editTratamiento(data: TipoTratamiento) {
    return await this.prisma.tipoTratamiento.update({
      where: { id: data.id },
      data,
    });
  }

  async deleteById(id: UUID) {
    return await this.prisma.tipoTratamiento.delete({ where: { id } });
  }
}
