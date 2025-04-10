import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Producto, Usuario } from '@prisma/client';
import { UUID } from 'crypto';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  async getAll(usuario_id: Usuario['id']) {
    return await this.prisma.producto.findMany({ where: { usuario_id } });
  }

  async addProducto(data: Partial<Producto>) {
    return await this.prisma.producto.create({ data: data as Producto });
  }

  async findById(id: UUID, usuario_id: Usuario['id']) {
    return await this.prisma.producto.findUnique({ where: { id, usuario_id } });
  }

  async editProducto(data: Partial<Producto>, usuario_id: Usuario['id']) {
    return await this.prisma.producto.update({
      where: { id: data.id, usuario_id },
      data,
    });
  }

  async deleteById(id: UUID, usuario_id: Usuario['id']) {
    return await this.prisma.producto.delete({ where: { id, usuario_id } });
  }
}
