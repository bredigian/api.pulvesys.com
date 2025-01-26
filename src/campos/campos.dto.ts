import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { LoteDTO } from 'src/lotes/lotes.dto';
import { Type } from 'class-transformer';
import { UUID } from 'crypto';

export class CampoStrictDTO {
  @IsUUID()
  id: UUID;

  @IsString()
  nombre: string;

  @IsNumber()
  hectareas: number;
}

export class CampoDTO {
  @IsOptional()
  id: UUID;

  @IsString()
  nombre: string;

  @IsNumber()
  hectareas: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoteDTO)
  lotes: LoteDTO[];
}
