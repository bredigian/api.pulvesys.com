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

import { ProductosService } from './productos.service';
import { ProductoDTO, ProductoStrictDTO } from './productos.dto';
import { UUID } from 'crypto';
import { AuthGuard } from 'src/auth/auth.guard';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { Log } from '@prisma/client';
import { HistorialService } from 'src/historial/historial.service';

@Controller('productos')
export class ProductosController {
  constructor(
    private readonly service: ProductosService,
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly logService: HistorialService,
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
  async addProducto(
    @Res() response: Response,
    @Body() data: ProductoDTO,
    @Headers('Authorization') authorization: string,
  ) {
    try {
      const { sub: usuario_id } = await this.jwtService.decode(
        authorization?.substring(7),
      );
      const { id, empresa_id, rol } =
        await this.usuariosService.findById(usuario_id);

      const producto = await this.service.addProducto({
        ...data,
        usuario_id: rol === 'INDIVIDUAL' && empresa_id ? empresa_id : id,
      });

      const PAYLOAD_LOG: Log = {
        usuario_id: id,
        type: 'PRODUCTO',
        description: `Se agregó el producto ${producto.nombre}.`,
        id: undefined,
        createdAt: undefined,
      };

      await this.logService.createLog(PAYLOAD_LOG);

      return response.json(producto);
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
  async editProducto(
    @Res() response: Response,
    @Body() data: ProductoStrictDTO,
    @Headers('Authorization') authorization: string,
  ) {
    try {
      const { sub: usuario_id } = await this.jwtService.decode(
        authorization?.substring(7),
      );
      const { id, empresa_id, rol } =
        await this.usuariosService.findById(usuario_id);

      const updated = await this.service.editProducto(
        data,
        rol === 'INDIVIDUAL' && empresa_id ? empresa_id : id,
      );

      const PAYLOAD_LOG: Log = {
        usuario_id: id,
        type: 'PRODUCTO',
        description: `Se modificó el producto ${updated.nombre}.`,
        id: undefined,
        createdAt: undefined,
      };

      await this.logService.createLog(PAYLOAD_LOG);

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
      const { id: producto_id } = data;

      const { sub: usuario_id } = await this.jwtService.decode(
        authorization?.substring(7),
      );
      const { id, empresa_id, rol } =
        await this.usuariosService.findById(usuario_id);

      const deleted = await this.service.deleteById(
        producto_id,
        rol === 'INDIVIDUAL' && empresa_id ? empresa_id : id,
      );

      const PAYLOAD_LOG: Log = {
        usuario_id: id,
        type: 'PRODUCTO',
        description: `Se eliminó el producto ${deleted.nombre}.`,
        id: undefined,
        createdAt: undefined,
      };

      await this.logService.createLog(PAYLOAD_LOG);

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
