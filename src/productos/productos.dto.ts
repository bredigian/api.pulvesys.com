import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UNIDAD } from '@prisma/client';
import { UUID } from 'crypto';

export class ProductoDTO {
  @IsOptional()
  id: UUID;

  @IsString()
  nombre: string;

  @IsEnum(UNIDAD)
  unidad: UNIDAD;

  @IsOptional()
  @IsNumber()
  cantidad: number;
}

export class ProductoStrictDTO {
  @IsUUID()
  id: UUID;

  @IsString()
  nombre: string;

  @IsEnum(UNIDAD)
  unidad: UNIDAD;

  @IsOptional()
  @IsNumber()
  cantidad: number;
}
