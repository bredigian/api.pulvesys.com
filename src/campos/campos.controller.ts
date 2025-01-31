import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Version,
} from '@nestjs/common';

import { CamposService } from './campos.service';
import { CampoDTO, CampoStrictDTO } from './campos.dto';
import { UUID } from 'crypto';
import { LotesService } from 'src/lotes/lotes.service';
import { CoordinadasService } from 'src/coordinadas/coordinadas.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('campos')
export class CamposController {
  constructor(
    private readonly service: CamposService,
    private readonly lotesService: LotesService,
    private readonly coordinadaService: CoordinadasService,
  ) {}

  @Get()
  @Version('1')
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ forbidNonWhitelisted: true }))
  async addCampo(@Body() data: CampoDTO) {
    try {
      const campo = await this.service.addCampo({
        id: undefined,
        nombre: data.nombre,
      });

      const { Lote } = data;
      for (const lote of Lote) {
        const loteCreated = await this.lotesService.addLote({
          id: undefined,
          nombre: lote.nombre,
          hectareas: lote.hectareas,
          color: lote.color,
          campo_id: campo.id,
        });
        for (const zona of lote.zona) {
          await this.coordinadaService.addCoordinada({
            id: undefined,
            lote_id: loteCreated.id,
            lat: zona.lat,
            lng: zona.lng,
          });
        }
      }

      return campo;
    } catch (error) {
      if (error) throw error;

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }

  @Put()
  @Version('1')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ forbidNonWhitelisted: true }))
  async editCampo(@Body() data: CampoStrictDTO) {
    try {
      return await this.service.editCampo(data);
    } catch (error) {
      if (error) throw error;

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }

  @Delete()
  @Version('1')
  @UseGuards(AuthGuard)
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
