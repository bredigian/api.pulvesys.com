import { LotesService } from './lotes.service';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [LotesService, PrismaService],
})
export class LotesModule {}
