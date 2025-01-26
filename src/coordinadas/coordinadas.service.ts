import { Coordinada } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CoordinadasService {
  constructor(private prisma: PrismaService) {}

  async addCoordinada(data: Coordinada) {
    return await this.prisma.coordinada.create({ data });
  }
}
