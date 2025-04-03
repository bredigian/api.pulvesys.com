import { AuthService } from 'src/auth/auth.service';
import { HashService } from 'src/lib/hash.service';
import { HistorialService } from 'src/historial/historial.service';
import { JwtService } from '@nestjs/jwt';
import { MercadopagoService } from 'src/mercadopago/mercadopago.service';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SesionesService } from 'src/sesiones/sesiones.service';
import { SuscripcionesService } from 'src/suscripciones/suscripciones.service';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

@Module({
  controllers: [UsuariosController],
  providers: [
    UsuariosService,
    AuthService,
    HashService,
    SesionesService,
    PrismaService,
    HistorialService,
    MercadopagoService,
    SuscripcionesService,
  ],
})
export class UsuariosModule {}
