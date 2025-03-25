import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { SesionesService } from 'src/sesiones/sesiones.service';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Module({
  controllers: [ProductosController],
  providers: [
    ProductosService,
    PrismaService,
    SesionesService,
    UsuariosService,
  ],
})
export class ProductosModule {}
