import { AplicacionesService } from 'src/aplicaciones/aplicaciones.service';
import { CamposService } from 'src/campos/campos.service';
import { ConsumoProductoService } from 'src/consumo-producto/consumo-producto.service';
import { CultivosService } from 'src/cultivos/cultivos.service';
import { DetallesService } from 'src/detalles/detalles.service';
import { HistorialService } from 'src/historial/historial.service';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductosService } from 'src/productos/productos.service';
import { PulverizacionesController } from './pulverizaciones.controller';
import { PulverizacionesService } from './pulverizaciones.service';
import { SesionesService } from 'src/sesiones/sesiones.service';
import { TratamientosService } from 'src/tratamientos/tratamientos.service';
import { UsuariosService } from 'src/usuarios/usuarios.service';

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
    UsuariosService,
    HistorialService,
  ],
})
export class PulverizacionesModule {}
