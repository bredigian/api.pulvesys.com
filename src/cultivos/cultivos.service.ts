import { Cultivo } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CultivosService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return await this.prisma.cultivo.findMany();
  }

  async addCultivo(data: Cultivo) {
    return await this.prisma.cultivo.create({ data });
  }
}
