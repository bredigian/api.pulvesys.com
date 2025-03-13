import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Headers,
  InternalServerErrorException,
  Post,
  Put,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Version,
} from '@nestjs/common';
import { CultivosService } from './cultivos.service';
import { CultivoDTO, CultivoStrictDTO } from './cultivos.dto';
import { UUID } from 'crypto';
import { AuthGuard } from 'src/auth/auth.guard';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('cultivos')
export class CultivosController {
  constructor(
    private readonly service: CultivosService,
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
      const data = await this.service.getAll(usuario_id);
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
  async addCultivo(
    @Res() response: Response,
    @Body() data: CultivoDTO,
    @Headers('Authorization') authorization: string,
  ) {
    try {
      const { sub: usuario_id } = await this.jwtService.decode(
        authorization?.substring(7),
      );
      const cultivo = await this.service.addCultivo({ ...data, usuario_id });

      return response.json(cultivo);
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
  async editCultivo(
    @Res() response: Response,
    @Body() data: CultivoStrictDTO,
    @Headers('Authorization') authorization: string,
  ) {
    try {
      const { sub: usuario_id } = await this.jwtService.decode(
        authorization?.substring(7),
      );
      const updated = await this.service.editCultivo(data, usuario_id);
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
      const { id } = data;

      const { sub: usuario_id } = await this.jwtService.decode(
        authorization?.substring(7),
      );
      const deleted = await this.service.deleteById(id, usuario_id);
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
}
