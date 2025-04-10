import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Usuario } from '@prisma/client';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async getAllByEmpresaId(empresa_id: Usuario['id']) {
    return await this.prisma.usuario.findMany({ where: { empresa_id } });
  }

  async countAllByEmpresaId(empresa_id: Usuario['id']) {
    return await this.prisma.usuario.count({ where: { empresa_id } });
  }

  async createUser(data: Partial<Usuario>) {
    return await this.prisma.usuario.create({ data: data as Usuario });
  }

  async findByUsername(nombre_usuario: Usuario['nombre_usuario']) {
    return await this.prisma.usuario.findUnique({ where: { nombre_usuario } });
  }

  async findByEmail(email: Usuario['email']) {
    return await this.prisma.usuario.findUnique({ where: { email } });
  }

  async findById(id: Usuario['id']) {
    return await this.prisma.usuario.findUnique({ where: { id } });
  }

  async findByIdAndEmail(id: Usuario['id'], email: Usuario['email']) {
    return await this.prisma.usuario.findUnique({ where: { id, email } });
  }

  async updateById(id: Usuario['id'], password: Usuario['contrasena']) {
    return await this.prisma.usuario.update({
      where: { id },
      data: { contrasena: password },
    });
  }
}
