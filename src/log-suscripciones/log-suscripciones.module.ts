import { LogSuscripcionesController } from './log-suscripciones.controller';
import { LogSuscripcionesService } from './log-suscripciones.service';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [LogSuscripcionesController],
  providers: [LogSuscripcionesService, PrismaService],
})
export class LogSuscripcionesModule {}
