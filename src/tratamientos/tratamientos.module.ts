import { HistorialService } from 'src/historial/historial.service';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SesionesService } from 'src/sesiones/sesiones.service';
import { TratamientosController } from './tratamientos.controller';
import { TratamientosService } from './tratamientos.service';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Module({
  controllers: [TratamientosController],
  providers: [
    TratamientosService,
    PrismaService,
    SesionesService,
    UsuariosService,
    HistorialService,
  ],
})
export class TratamientosModule {}
