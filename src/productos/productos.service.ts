import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Producto } from '@prisma/client';
import { UUID } from 'crypto';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return await this.prisma.producto.findMany();
  }

  async addProducto(data: Producto) {
    return await this.prisma.producto.create({ data });
  }

  async findById(id: UUID) {
    return await this.prisma.producto.findUnique({ where: { id } });
  }

  async editProducto(data: Producto) {
    return await this.prisma.producto.update({ where: { id: data.id }, data });
  }

  async deleteById(id: UUID) {
    return await this.prisma.producto.delete({ where: { id } });
  }
}
