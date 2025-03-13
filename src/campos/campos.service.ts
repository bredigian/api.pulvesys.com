import { Campo, Usuario } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UUID } from 'crypto';
import { CampoDTO } from './campos.dto';

@Injectable()
export class CamposService {
  constructor(private prisma: PrismaService) {}

  async getAll(usuario_id: Usuario['id']) {
    return await this.prisma.campo.findMany({
      where: { usuario_id },
      include: { Lote: { include: { Coordinada: true } } },
    });
  }

  async addCampo(data: Campo) {
    return await this.prisma.campo.create({ data });
  }

  async findById(id: UUID, usuario_id: Usuario['id']) {
    return await this.prisma.campo.findUnique({
      where: { id, usuario_id },
      include: { Lote: true },
    });
  }

  async editCampo(data: CampoDTO, usuario_id: Usuario['id']) {
    return await this.prisma.campo.update({
      where: { id: data.id, usuario_id },
      data: { nombre: data.nombre },
    });
  }

  async deleteById(id: UUID, usuario_id: Usuario['id']) {
    return await this.prisma.campo.delete({ where: { id, usuario_id } });
  }
}
