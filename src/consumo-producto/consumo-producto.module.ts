import { ConsumoProductoService } from './consumo-producto.service';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [ConsumoProductoService, PrismaService],
})
export class ConsumoProductoModule {}
