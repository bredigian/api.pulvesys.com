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

import { CamposService } from './campos.service';
import { CampoDTO } from './campos.dto';

@Controller('campos')
export class CamposController {
  constructor(private readonly service: CamposService) {}

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
  async addCampo(@Body() data: CampoDTO) {
    try {
      return await this.service.addCampo(data);
    } catch (error) {
      if (error) throw error;

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }
}
