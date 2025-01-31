import { HashService } from 'src/lib/hash.service';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Usuario } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private hashService: HashService,
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
}
