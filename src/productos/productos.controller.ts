import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  UsePipes,
  ValidationPipe,
  Version,
} from '@nestjs/common';

import { ProductosService } from './productos.service';
import { ProductoDTO } from './productos.dto';

@Controller('productos')
export class ProductosController {
  constructor(private readonly service: ProductosService) {}

  @Get()
  @Version('1')
  async getAll() {
    try {
      return await this.service.getAll();
    } catch (error) {
      if (error) throw error;

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }

  @Post()
  @Version('1')
  @UsePipes(new ValidationPipe({ forbidNonWhitelisted: true }))
  async addProducto(@Body() data: ProductoDTO) {
    try {
      return await this.service.addProducto(data);
    } catch (error) {
      if (error) throw error;

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }
}
