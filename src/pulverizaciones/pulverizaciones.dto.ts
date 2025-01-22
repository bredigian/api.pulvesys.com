import {
  IsArray,
  IsDate,
  IsDateString,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { AplicacionDTO } from 'src/aplicaciones/aplicaciones.dto';
import { DetalleDTO } from 'src/detalles/detalles.dto';
import { Type } from 'class-transformer';
import { UUID } from 'crypto';

export class PulverizacionBaseDTO {
  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsUUID()
  detalle_id: UUID;
}

export class PulverizacionDTO extends PulverizacionBaseDTO {
  @IsOptional()
  id: UUID;

  @ValidateNested()
  @Type(() => DetalleDTO)
  detalle: DetalleDTO;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AplicacionDTO)
  productos: AplicacionDTO[];
}
