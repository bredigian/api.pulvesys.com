import { CultivosController } from './cultivos.controller';
import { CultivosService } from './cultivos.service';
import { HistorialService } from 'src/historial/historial.service';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SesionesService } from 'src/sesiones/sesiones.service';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Module({
  controllers: [CultivosController],
  providers: [
    CultivosService,
    PrismaService,
    SesionesService,
    UsuariosService,
    HistorialService,
  ],
})
export class CultivosModule {}
