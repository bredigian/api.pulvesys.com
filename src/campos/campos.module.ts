import { CamposController } from './campos.controller';
import { CamposService } from './campos.service';
import { CoordinadasService } from 'src/coordinadas/coordinadas.service';
import { LotesService } from 'src/lotes/lotes.service';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CamposController],
  providers: [CamposService, PrismaService, LotesService, CoordinadasService],
})
export class CamposModule {}
