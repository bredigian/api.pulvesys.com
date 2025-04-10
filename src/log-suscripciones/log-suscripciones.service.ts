import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SuscripcionLog } from '@prisma/client';

@Injectable()
export class LogSuscripcionesService {
  constructor(private prisma: PrismaService) {}

  async createLog(data: Partial<SuscripcionLog>) {
    return await this.prisma.suscripcionLog.create({
      data: data as SuscripcionLog,
    });
  }
}
