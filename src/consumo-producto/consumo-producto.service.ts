import { ConsumoProducto } from '@prisma/client';
import { ConsumoProductoDTO } from './consumo-producto.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConsumoProductoService {
  constructor(private prisma: PrismaService) {}

  async createConsumo(data: ConsumoProductoDTO) {
    return await this.prisma.consumoProducto.create({ data });
  }

  async updateValores(data: ConsumoProducto) {
    return await this.prisma.consumoProducto.update({
      where: { id: data.id },
      data,
    });
  }
}
