import { HashService } from 'src/lib/hash.service';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Usuario } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { randomUUID, UUID } from 'node:crypto';
import { Tokens } from 'src/types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private hashService: HashService,
    private jwtService: JwtService,
  ) {}

  async findByUsername(nombre_usuario: Usuario['nombre_usuario']) {
    return await this.prisma.usuario.findUnique({ where: { nombre_usuario } });
  }

  async verifyPassword(
    password: Usuario['contrasena'],
    hash: Usuario['contrasena'],
  ) {
    return await this.hashService.compareHash(password, hash);
  }

  async generateTokens(user_id: Usuario['id']): Promise<Tokens> {
    const access_token = await this.jwtService.signAsync({ sub: user_id });
    const refresh_token = randomUUID();

    return { access_token, refresh_token };
  }
}
