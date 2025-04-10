import {
  Controller,
  Get,
  InternalServerErrorException,
  Res,
  UseGuards,
  Version,
} from '@nestjs/common';
import { PlanesService } from './planes.service';
import { Response } from 'express';

@Controller('planes')
export class PlanesController {
  constructor(private readonly service: PlanesService) {}

  @Get()
  @Version('1')
  async getPlanes(@Res() response: Response) {
    try {
      const planes = await this.service.getPublicPlanes();

      return response.json(planes);
    } catch (e) {
      if (e) throw e;

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }
}
