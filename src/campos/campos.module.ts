import { CamposController } from './campos.controller';
import { CamposService } from './campos.service';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CamposController],
  providers: [CamposService, PrismaService],
})
export class CamposModule {}
