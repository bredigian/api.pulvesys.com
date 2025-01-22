import { AplicacionesService } from 'src/aplicaciones/aplicaciones.service';
import { ConsumoProductoService } from 'src/consumo-producto/consumo-producto.service';
import { DetallesService } from 'src/detalles/detalles.service';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PulverizacionesController } from './pulverizaciones.controller';
import { PulverizacionesService } from './pulverizaciones.service';

@Module({
  controllers: [PulverizacionesController],
  providers: [
    PulverizacionesService,
    DetallesService,
    AplicacionesService,
    ConsumoProductoService,
    PrismaService,
  ],
})
export class PulverizacionesModule {}
