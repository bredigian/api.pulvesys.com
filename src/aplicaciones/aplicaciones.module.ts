import { AplicacionesService } from './aplicaciones.service';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [AplicacionesService, PrismaService],
})
export class AplicacionesModule {}
