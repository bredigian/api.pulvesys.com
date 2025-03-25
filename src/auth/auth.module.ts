import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HashService } from 'src/lib/hash.service';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SesionesService } from 'src/sesiones/sesiones.service';
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
  ],
})
export class AuthModule {}
