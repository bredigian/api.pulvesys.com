import { LogSuscripcionesService } from 'src/log-suscripciones/log-suscripciones.service';
import { MercadopagoService } from 'src/mercadopago/mercadopago.service';
import { Module } from '@nestjs/common';
import { PlanesService } from 'src/planes/planes.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SesionesService } from 'src/sesiones/sesiones.service';
import { SuscripcionesController } from './suscripciones.controller';
import { SuscripcionesService } from './suscripciones.service';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Module({
  controllers: [SuscripcionesController],
  providers: [
    SuscripcionesService,
    LogSuscripcionesService,
    PrismaService,
    MercadopagoService,
    PlanesService,
    SesionesService,
    UsuariosService,
  ],
})
export class SuscripcionesModule {}
