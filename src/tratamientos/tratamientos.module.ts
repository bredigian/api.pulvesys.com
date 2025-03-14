import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TratamientosController } from './tratamientos.controller';
import { TratamientosService } from './tratamientos.service';
import { SesionesService } from 'src/sesiones/sesiones.service';

@Module({
  controllers: [TratamientosController],
  providers: [TratamientosService, PrismaService, SesionesService],
})
export class TratamientosModule {}
