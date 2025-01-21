import { Campo } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CamposService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return await this.prisma.campo.findMany();
  }

  async addCampo(data: Campo) {
    return await this.prisma.campo.create({ data });
  }
}
