import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UsePipes,
  ValidationPipe,
  Version,
} from '@nestjs/common';

import { PulverizacionesService } from './pulverizaciones.service';
import { ConsumoProducto, Pulverizacion } from '@prisma/client';
import { PulverizacionDTO } from './pulverizaciones.dto';
import { DetallesService } from 'src/detalles/detalles.service';
import { AplicacionesService } from 'src/aplicaciones/aplicaciones.service';
import { ConsumoProductoService } from 'src/consumo-producto/consumo-producto.service';
import { ConsumoProductoDTO } from 'src/consumo-producto/consumo-producto.dto';
import { UUID } from 'crypto';

@Controller('pulverizaciones')
export class PulverizacionesController {
  constructor(
    private readonly service: PulverizacionesService,
    private readonly detallesService: DetallesService,
    private readonly aplicacionesService: AplicacionesService,
    private readonly consumoProductosService: ConsumoProductoService,
  ) {}

  @Post()
  @Version('1')
  @UsePipes(new ValidationPipe({ forbidNonWhitelisted: true }))
  async createPulverizacion(@Body() data: PulverizacionDTO) {
    try {
      const detalle = await this.detallesService.addDetalle(data.detalle);
      const pulverizacion = await this.service.createPulverizacion({
        fecha: new Date(data.fecha).toISOString(),
        detalle_id: detalle.id as UUID,
      });

      for (let i = 0; i < data.productos.length; i++) {
        const aplicacion = data.productos[i];
        await this.aplicacionesService.createAplicacion({
          ...aplicacion,
          pulverizacion_id: pulverizacion.id,
        });

        const consumo_payload: ConsumoProductoDTO = {
          producto_id: aplicacion.producto_id,
          pulverizacion_id: pulverizacion.id as UUID,
          valor_teorico: aplicacion.dosis * detalle.hectareas,
          valor_real: null,
          valor_devolucion: null,
        };
        await this.consumoProductosService.createConsumo(consumo_payload);
      }

      return pulverizacion;
    } catch (error) {
      if (error instanceof Error) throw error;

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }
}
