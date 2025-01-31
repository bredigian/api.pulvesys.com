import { JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SesionesService } from './sesiones.service';

@Module({
  providers: [SesionesService, JwtService, PrismaService],
})
export class SesionesModule {}
