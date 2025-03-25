import { HashService } from 'src/lib/hash.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Tokens } from 'src/types/auth.types';
import { Usuario } from '@prisma/client';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private hashService: HashService,
    private jwtService: JwtService,
  ) {}

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
