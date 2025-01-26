import { CoordinadasService } from './coordinadas.service';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [CoordinadasService, PrismaService],
})
export class CoordinadasModule {}
