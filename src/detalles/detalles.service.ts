import { Detalle } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UUID } from 'crypto';

@Injectable()
export class DetallesService {
  constructor(private prisma: PrismaService) {}

  async addDetalle(data: Detalle) {
    return await this.prisma.detalle.create({ data });
  }

  async deleteById(id: UUID) {
    return await this.prisma.detalle.delete({ where: { id } });
  }
}
