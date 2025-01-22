import {
  Body,
  Controller,
  InternalServerErrorException,
  NotFoundException,
  Post,
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
  ) {}

  @Post()
  @Version('1')
  @UsePipes(new ValidationPipe({ forbidNonWhitelisted: true }))
  async createPulverizacion(@Body() data: PulverizacionDTO) {
    try {
      const campo = await this.camposService.findById(data?.detalle?.campo_id);
      if (!campo)
        throw new NotFoundException('El campo seleccionado no existe.');

      const cultivo = await this.cultivosService.findById(
        data?.detalle?.cultivo_id,
      );
      if (!cultivo)
        throw new NotFoundException('El cultivo seleccionado no existe.');

      const tratamiento = await this.tratamientosService.findById(
        data?.detalle?.tratamiento_id,
      );

      if (!tratamiento)
        throw new NotFoundException('El tratamiento seleccionado no existe.');

      const detalle = await this.detallesService.addDetalle(data.detalle);
      const pulverizacion = await this.service.createPulverizacion({
        fecha: new Date(data.fecha).toISOString(),
        detalle_id: detalle.id as UUID,
      });

      for (let i = 0; i < data.productos.length; i++) {
        const aplicacion = data.productos[i];
        const exists = await this.productosService.findById(
          aplicacion?.producto_id,
        );
        if (!exists) {
          await this.service.deleteById(pulverizacion?.id as UUID);
          await this.detallesService.deleteById(detalle?.id as UUID);

          throw new NotFoundException('El producto seleccionado no existe.');
        }
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
