import { CamposController } from './campos.controller';
import { CamposService } from './campos.service';
import { CoordinadasService } from 'src/coordinadas/coordinadas.service';
import { HistorialService } from 'src/historial/historial.service';
import { LotesService } from 'src/lotes/lotes.service';
import { MercadopagoService } from 'src/mercadopago/mercadopago.service';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SesionesService } from 'src/sesiones/sesiones.service';
import { SuscripcionesService } from 'src/suscripciones/suscripciones.service';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Module({
  controllers: [CamposController],
  providers: [
    CamposService,
    PrismaService,
    LotesService,
    CoordinadasService,
    SesionesService,
    UsuariosService,
    HistorialService,
    MercadopagoService,
    SuscripcionesService,
  ],
})
export class CamposModule {}
