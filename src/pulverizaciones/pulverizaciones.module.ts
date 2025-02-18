import { AplicacionesService } from 'src/aplicaciones/aplicaciones.service';
import { CamposService } from 'src/campos/campos.service';
import { ConsumoProductoService } from 'src/consumo-producto/consumo-producto.service';
import { CultivosService } from 'src/cultivos/cultivos.service';
import { DetallesService } from 'src/detalles/detalles.service';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductosService } from 'src/productos/productos.service';
import { PulverizacionesController } from './pulverizaciones.controller';
import { PulverizacionesService } from './pulverizaciones.service';
import { TratamientosService } from 'src/tratamientos/tratamientos.service';
import { SesionesService } from 'src/sesiones/sesiones.service';

@Module({
  controllers: [PulverizacionesController],
  providers: [
    PulverizacionesService,
    DetallesService,
    AplicacionesService,
    ConsumoProductoService,
    CamposService,
    CultivosService,
    TratamientosService,
    ProductosService,
    PrismaService,
    SesionesService,
  ],
})
export class PulverizacionesModule {}
