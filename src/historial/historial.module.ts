import { HistorialController } from './historial.controller';
import { HistorialService } from './historial.service';
import { MercadopagoService } from 'src/mercadopago/mercadopago.service';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SesionesService } from 'src/sesiones/sesiones.service';
import { SuscripcionesService } from 'src/suscripciones/suscripciones.service';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Module({
  controllers: [HistorialController],
  providers: [
    HistorialService,
    PrismaService,
    SesionesService,
    UsuariosService,
    MercadopagoService,
    SuscripcionesService,
  ],
})
export class HistorialModule {}
