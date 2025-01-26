import { Injectable } from '@nestjs/common';
import { Lote } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LotesService {
  constructor(private prisma: PrismaService) {}

  async addLote(data: Lote) {
    return this.prisma.lote.create({ data });
  }
}
