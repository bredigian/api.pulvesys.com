import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
  Version,
} from '@nestjs/common';
import { CultivosService } from './cultivos.service';
import { CultivoDTO, CultivoStrictDTO } from './cultivos.dto';
import { UUID } from 'crypto';
import { ProductoStrictDTO } from 'src/productos/productos.dto';

@Controller('cultivos')
export class CultivosController {
  constructor(private readonly service: CultivosService) {}

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
  async addCultivo(@Body() data: CultivoDTO) {
    try {
      return await this.service.addCultivo(data);
    } catch (error) {
      if (error) throw error;

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }

  @Put()
  @Version('1')
  @UsePipes(new ValidationPipe({ forbidNonWhitelisted: true }))
  async editCultivo(@Body() data: CultivoStrictDTO) {
    try {
      return await this.service.editCultivo(data);
    } catch (error) {
      if (error) throw error;

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }

  @Delete()
  @Version('1')
  @UsePipes(new ValidationPipe({ forbidNonWhitelisted: true }))
  async deleteById(@Body() data: { id: UUID }) {
    try {
      const { id } = data;

      return await this.service.deleteById(id);
    } catch (error) {
      if (error) throw error;

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }
}
