import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Headers,
  InternalServerErrorException,
  NotFoundException,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Version,
} from '@nestjs/common';

import { PulverizacionesService } from './pulverizaciones.service';

import { PulverizacionDTO } from './pulverizaciones.dto';
import { DetallesService } from 'src/detalles/detalles.service';
import { AplicacionesService } from 'src/aplicaciones/aplicaciones.service';
import { ConsumoProductoService } from 'src/consumo-producto/consumo-producto.service';
import { ConsumoProductoDTO } from 'src/consumo-producto/consumo-producto.dto';
import { UUID } from 'crypto';
import { CamposService } from 'src/campos/campos.service';
import { CultivosService } from 'src/cultivos/cultivos.service';
import { TratamientosService } from 'src/tratamientos/tratamientos.service';
import { ProductosService } from 'src/productos/productos.service';
import { AplicacionConConsumoDTO } from 'src/aplicaciones/aplicaciones.dto';
import {
  Aplicacion,
  ConsumoProducto,
  Log,
  Pulverizacion,
} from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { HistorialService } from 'src/historial/historial.service';
import { DateTime } from 'luxon';

@Controller('pulverizaciones')
export class PulverizacionesController {
  constructor(
    private readonly service: PulverizacionesService,
    private readonly detallesService: DetallesService,
    private readonly aplicacionesService: AplicacionesService,
    private readonly consumoProductosService: ConsumoProductoService,
    private readonly camposService: CamposService,
    private readonly cultivosService: CultivosService,
    private readonly tratamientosService: TratamientosService,
    private readonly productosService: ProductosService,
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
      const { id, rol } = await this.usuariosService.findById(usuario_id);

      if (rol === 'EMPRESA') {
        const data = await this.service.getPulverizacionesByEmpresa(id);
        return response.json(data);
      }

      const data = await this.service.getPulverizaciones(id);
      return response.json(data);
    } catch (error) {
      if (error) throw error;

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }

  @Get('detalle')
  @Version('1')
  @UseGuards(AuthGuard)
  async getById(
    @Res() response: Response,
    @Query('id') pulverizacion_id: UUID,
    @Headers('Authorization') authorization: string,
  ) {
    try {
      if (!pulverizacion_id)
        throw new BadRequestException(
          'El ID es requerido para continuar con la solicitud.',
        );

      const { sub: usuario_id } = await this.jwtService.decode(
        authorization?.substring(7),
      );
      const { id, rol } = await this.usuariosService.findById(usuario_id);

      const detalle =
        rol === 'EMPRESA'
          ? await this.service.getByIdByEmpresa(pulverizacion_id, id)
          : await this.service.getById(pulverizacion_id, id);

      if (!detalle)
        throw new NotFoundException('La pulverización no fue encontrada.');

      return response.json(detalle);
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
  async createPulverizacion(
    @Res() response: Response,
    @Body() data: PulverizacionDTO,
    @Headers('Authorization') authorization: string,
  ) {
    try {
      const { sub: usuario_id } = await this.jwtService.decode(
        authorization?.substring(7),
      );
      const { id, empresa_id, rol } =
        await this.usuariosService.findById(usuario_id);

      const campo = await this.camposService.findById(
        data?.detalle?.campo_id,
        rol === 'INDIVIDUAL' && empresa_id ? empresa_id : id,
      );
      if (!campo)
        throw new NotFoundException('El campo seleccionado no existe.');

      const lotes = campo.Lote.map((lote) => lote.nombre);

      for (const lote of data?.detalle.lotes) {
        if (!lotes.includes(lote)) {
          throw new BadRequestException(
            `El lote ${lote} no corresponde al campo seleccionado.`,
          );
        }
      }

      const cultivo = await this.cultivosService.findById(
        data?.detalle?.cultivo_id,
        rol === 'INDIVIDUAL' && empresa_id ? empresa_id : id,
      );
      if (!cultivo)
        throw new NotFoundException('El cultivo seleccionado no existe.');

      const tratamiento = await this.tratamientosService.findById(
        data?.detalle?.tratamiento_id,
        rol === 'INDIVIDUAL' && empresa_id ? empresa_id : id,
      );

      if (!tratamiento)
        throw new NotFoundException('El tratamiento seleccionado no existe.');

      const detalle = await this.detallesService.addDetalle(data.detalle);
      const pulverizacion = await this.service.createPulverizacion({
        id: undefined,
        fecha: new Date(data.fecha),
        detalle_id: detalle.id as UUID,
        usuario_id: id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      for (let i = 0; i < data.productos.length; i++) {
        const aplicacion = data.productos[i];
        const exists = await this.productosService.findById(
          aplicacion?.producto_id,
          rol === 'INDIVIDUAL' && empresa_id ? empresa_id : id,
        );
        if (!exists) {
          await this.service.deleteById(
            pulverizacion?.id as UUID,
            rol === 'INDIVIDUAL' && empresa_id ? empresa_id : id,
          );
          await this.detallesService.deleteById(detalle?.id as UUID);

          throw new NotFoundException('El producto seleccionado no existe.');
        }
        await this.aplicacionesService.createAplicacion({
          ...aplicacion,
          pulverizacion_id: pulverizacion.id,
        });

        const selectedHectareas = campo.Lote.filter((lote) =>
          detalle.lotes.includes(lote.nombre),
        ).reduce((acc, lote) => acc + lote.hectareas, 0);

        const consumo_payload: ConsumoProductoDTO = {
          producto_id: aplicacion.producto_id,
          pulverizacion_id: pulverizacion.id as UUID,
          valor_teorico: aplicacion.dosis * selectedHectareas,
          valor_real: null,
          valor_devolucion: null,
        };
        await this.consumoProductosService.createConsumo(consumo_payload);
      }

      const PAYLOAD_LOG: Log = {
        usuario_id: id,
        type: 'PULVERIZACION',
        description: `Se registró una nueva pulverización para la ubicación ${campo.nombre}.`,
        id: undefined,
        createdAt: undefined,
      };

      await this.logService.createLog(PAYLOAD_LOG);

      return response.json(pulverizacion);
    } catch (error) {
      if (error instanceof Error) throw error;

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }

  @Patch('aplicacion')
  @Version('1')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ forbidNonWhitelisted: true }))
  async editAplicacionConsumo(
    @Res() response: Response,
    @Body() data: AplicacionConConsumoDTO,
    @Headers('Authorization') authorization: string,
  ) {
    try {
      const APLICACION_DATA: Aplicacion = {
        pulverizacion_id: data.pulverizacion_id,
        producto_id: data.producto_id,
        id: data.id,
        dosis: data.dosis,
      };
      const aplicacionUpdated =
        await this.aplicacionesService.editAplicacion(APLICACION_DATA);

      const { sub: usuario_id } = await this.jwtService.decode(
        authorization?.substring(7),
      );

      const { id, rol } = await this.usuariosService.findById(usuario_id);

      const pulverizacion =
        rol === 'EMPRESA'
          ? await this.service.getByIdByEmpresa(data.pulverizacion_id, id)
          : await this.service.getById(data.pulverizacion_id, id);

      if (!pulverizacion)
        throw new NotFoundException('No se encontró la pulverización');

      const selectedHectareas = pulverizacion.detalle.campo.Lote.filter(
        (lote) => pulverizacion.detalle.lotes.includes(lote.nombre),
      ).reduce((acc, lote) => acc + lote.hectareas, 0);

      const VALOR_TEORICO = aplicacionUpdated.dosis * selectedHectareas;

      const CONSUMO_DATA: ConsumoProducto = {
        id: data.consumo_id,
        pulverizacion_id: data.pulverizacion_id,
        producto_id: data.producto_id,
        valor_teorico: VALOR_TEORICO,
        valor_real: data.valor_real ?? null,
        valor_devolucion: !data.valor_real
          ? null
          : VALOR_TEORICO - data.valor_real,
      };
      const updatedValoresConsumo =
        await this.consumoProductosService.updateValores(CONSUMO_DATA);

      const updated =
        rol === 'EMPRESA'
          ? await this.service.getByIdByEmpresa(data.pulverizacion_id, id)
          : await this.service.getById(data.pulverizacion_id, id);

      const PAYLOAD_LOG: Log = {
        usuario_id: id,
        type: 'PULVERIZACION',
        description: `Se modificó el consumo de la aplicación de ${updatedValoresConsumo.producto.nombre} en la pulverización a realizar sobre ${updated.detalle.campo.nombre} el día ${DateTime.fromJSDate(new Date(updated.fecha)).setLocale('es-AR').toLocaleString(DateTime.DATE_SHORT)} que tiene como ID ${updated.id}.`,
        id: undefined,
        createdAt: undefined,
      };

      await this.logService.createLog(PAYLOAD_LOG);

      return response.json(updated);
    } catch (error) {
      if (error instanceof Error) throw error;

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
      const { id: pulverizacion_id } = data;

      const { sub: usuario_id } = await this.jwtService.decode(
        authorization?.substring(7),
      );
      const { id, rol } = await this.usuariosService.findById(usuario_id);

      const deleted =
        rol === 'EMPRESA'
          ? await this.service.deleteByEmpresaById(pulverizacion_id, id)
          : await this.service.deleteById(pulverizacion_id, usuario_id);

      const PAYLOAD_LOG: Log = {
        usuario_id: id,
        type: 'PULVERIZACION',
        description: `Se eliminó la pulverización a realizar sobre ${deleted.detalle.campo.nombre} el día ${DateTime.fromJSDate(new Date(deleted.fecha)).setLocale('es-AR').toLocaleString(DateTime.DATE_SHORT)}.`,
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

        throw new Error(error.message);
      }

      if (error) throw error;

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }
}
