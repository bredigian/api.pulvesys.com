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
import { TratamientoDTO } from './tratamientos.dto';
import { TratamientosService } from './tratamientos.service';
import { CultivoStrictDTO } from 'src/cultivos/cultivos.dto';
import { UUID } from 'crypto';

@Controller('tratamientos')
export class TratamientosController {
  constructor(private readonly service: TratamientosService) {}

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
  async addCultivo(@Body() data: TratamientoDTO) {
    try {
      return await this.service.addTratamiento(data);
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
  async editTratamiento(@Body() data: CultivoStrictDTO) {
    try {
      return await this.service.editTratamiento(data);
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
