import { CultivosController } from './cultivos.controller';
import { CultivosService } from './cultivos.service';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CultivosController],
  providers: [CultivosService, PrismaService],
})
export class CultivosModule {}
