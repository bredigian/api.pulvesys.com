import { Cultivo, Usuario } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UUID } from 'crypto';
import { CultivoDTO } from './cultivos.dto';

@Injectable()
export class CultivosService {
  constructor(private prisma: PrismaService) {}

  async getAll(usuario_id: Usuario['id']) {
    return await this.prisma.cultivo.findMany({ where: { usuario_id } });
  }

  async addCultivo(data: Cultivo) {
    return await this.prisma.cultivo.create({ data });
  }

  async findById(id: UUID, usuario_id: Usuario['id']) {
    return await this.prisma.cultivo.findUnique({ where: { id, usuario_id } });
  }

  async editCultivo(data: CultivoDTO, usuario_id: Usuario['id']) {
    return await this.prisma.cultivo.update({
      where: { id: data.id, usuario_id },
      data,
    });
  }

  async deleteById(id: UUID, usuario_id: Usuario['id']) {
    return await this.prisma.cultivo.delete({ where: { id, usuario_id } });
  }
}
