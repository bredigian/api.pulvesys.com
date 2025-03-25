import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Headers,
  InternalServerErrorException,
  Patch,
  Post,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Version,
} from '@nestjs/common';

import { CamposService } from './campos.service';
import { CampoDTO } from './campos.dto';
import { UUID } from 'crypto';
import { LotesService } from 'src/lotes/lotes.service';
import { CoordinadasService } from 'src/coordinadas/coordinadas.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Controller('campos')
export class CamposController {
  constructor(
    private readonly service: CamposService,
    private readonly lotesService: LotesService,
    private readonly coordinadaService: CoordinadasService,
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  @Version('1')
  @UseGuards(AuthGuard)
  async getAll(
    @Res() response: Response,
    @Headers('Authorization') authorization: string,
  ) {
    try {
      const { sub: usuario_id } = await this.jwtService.decode(
        authorization?.substring(7),
      );
      const { id, empresa_id, rol } =
        await this.usuariosService.findById(usuario_id);

      const data = await this.service.getAll(
        rol === 'INDIVIDUAL' && empresa_id ? empresa_id : id,
      );
      return response.json(data);
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
  async addCampo(
    @Res() response: Response,
    @Body() data: CampoDTO,
    @Headers('Authorization') authorization: string,
  ) {
    try {
      const { sub: usuario_id } = await this.jwtService.decode(
        authorization.substring(7),
      );
      const { id, empresa_id, rol } =
        await this.usuariosService.findById(usuario_id);

      const campo = await this.service.addCampo({
        id: undefined,
        nombre: data.nombre,
        usuario_id: rol === 'INDIVIDUAL' && empresa_id ? empresa_id : id,
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

      return response.json(campo);
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
  async editCampo(
    @Res() response: Response,
    @Body() data: CampoDTO,
    @Headers('Authorization') authorization: string,
  ) {
    try {
      const { sub: usuario_id } = await this.jwtService.decode(
        authorization?.substring(7),
      );
      const { id, empresa_id, rol } =
        await this.usuariosService.findById(usuario_id);

      await this.service.editCampo(
        data,
        rol === 'INDIVIDUAL' && empresa_id ? empresa_id : id,
      );

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

      const updated = await this.service.findById(
        data.id,
        rol === 'INDIVIDUAL' && empresa_id ? empresa_id : id,
      );
      return response.json(updated);
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
  async deleteById(
    @Res() response: Response,
    @Body() data: { id: UUID },
    @Headers('Authorization') authorization: string,
  ) {
    try {
      const { id: campo_id } = data;

      const { sub: usuario_id } = await this.jwtService.decode(
        authorization?.substring(7),
      );
      const { id, empresa_id, rol } =
        await this.usuariosService.findById(usuario_id);

      const deleted = await this.service.deleteById(
        campo_id,
        rol === 'INDIVIDUAL' && empresa_id ? empresa_id : id,
      );
      return response.json(deleted);
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

  @Delete('lote')
  @Version('1')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ forbidNonWhitelisted: true }))
  async deleteLoteById(@Res() response: Response, @Body() data: { id: UUID }) {
    try {
      const { id } = data;

      const deletedLote = await this.lotesService.deleteById(id);
      return response.json(deletedLote);
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
