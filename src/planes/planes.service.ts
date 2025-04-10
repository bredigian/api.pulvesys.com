import { Injectable } from '@nestjs/common';
import { Plan } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PlanesService {
  constructor(private prisma: PrismaService) {}

  async getPublicPlanes() {
    return await this.prisma.plan.findMany({
      where: { nombre: { not: 'ADMIN' } },
    });
  }

  async getById(id: Plan['id']) {
    return await this.prisma.plan.findUnique({ where: { id } });
  }
}
