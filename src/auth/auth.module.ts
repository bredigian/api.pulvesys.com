import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HashService } from 'src/lib/hash.service';
import { JwtModule } from '@nestjs/jwt';
import { LogSuscripcionesService } from 'src/log-suscripciones/log-suscripciones.service';
import { MercadopagoService } from 'src/mercadopago/mercadopago.service';
import { Module } from '@nestjs/common';
import { PlanesService } from 'src/planes/planes.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RecoverTokenService } from 'src/recover-token/recover-token.service';
import { SesionesService } from 'src/sesiones/sesiones.service';
import { SuscripcionesService } from 'src/suscripciones/suscripciones.service';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: {
        expiresIn: '15m', // 15 minutos
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsuariosService,
    SesionesService,
    HashService,
    PrismaService,
    SuscripcionesService,
    LogSuscripcionesService,
    MercadopagoService,
    PlanesService,
    RecoverTokenService,
  ],
})
export class AuthModule {}
