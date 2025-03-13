import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TipoTratamiento, Usuario } from '@prisma/client';
import { UUID } from 'crypto';

@Injectable()
export class TratamientosService {
  constructor(private prisma: PrismaService) {}

  async getAll(usuario_id: Usuario['id']) {
    return await this.prisma.tipoTratamiento.findMany({
      where: { usuario_id },
    });
  }

  async addTratamiento(data: Partial<TipoTratamiento>) {
    return await this.prisma.tipoTratamiento.create({
      data: data as TipoTratamiento,
    });
  }

  async findById(id: UUID, usuario_id: Usuario['id']) {
    return await this.prisma.tipoTratamiento.findUnique({
      where: { id, usuario_id },
    });
  }

  async editTratamiento(
    data: Partial<TipoTratamiento>,
    usuario_id: Usuario['id'],
  ) {
    return await this.prisma.tipoTratamiento.update({
      where: { id: data.id, usuario_id },
      data,
    });
  }

  async deleteById(id: UUID, usuario_id: Usuario['id']) {
    return await this.prisma.tipoTratamiento.delete({
      where: { id, usuario_id },
    });
  }
}
