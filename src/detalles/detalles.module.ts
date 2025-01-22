import { DetallesService } from './detalles.service';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [DetallesService, PrismaService],
})
export class DetallesModule {}
