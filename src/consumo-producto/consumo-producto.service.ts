import { ConsumoProducto, Producto } from '@prisma/client';

import { ConsumoProductoDTO } from './consumo-producto.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConsumoProductoService {
  constructor(private prisma: PrismaService) {}

  async createConsumo(data: ConsumoProductoDTO) {
    return await this.prisma.consumoProducto.create({ data });
  }
}
