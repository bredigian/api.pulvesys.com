import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { SesionesService } from 'src/sesiones/sesiones.service';

@Module({
  controllers: [ProductosController],
  providers: [ProductosService, PrismaService, SesionesService],
})
export class ProductosModule {}
