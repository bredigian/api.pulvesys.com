import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Patch,
  Post,
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
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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

  @Patch()
  @Version('1')
  @UseGuards(AuthGuard)
  async editCampo(@Body() data: CampoDTO) {
    try {
      await this.service.editCampo(data);
      const { Lote } = data;
      for (const lote of Lote) {
        if ('id' in lote) {
          const savedLote = await this.lotesService.findByID(lote.id as UUID);
          if (savedLote) continue;
          else
            throw new BadRequestException(
              'Ocurrió un problema al verificar los lotes ya guardados',
            );
        }

        const loteCreated = await this.lotesService.addLote({
          id: undefined,
          nombre: lote.nombre,
          hectareas: lote.hectareas,
          color: lote.color,
          campo_id: data.id,
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

      return await this.service.findById(data.id);
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
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2003')
          throw new ConflictException(
            'No es posible eliminar lo seleccionado ya que es utilizado por otros objetos.',
          );
      }

      if (error) throw error;

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }
}
