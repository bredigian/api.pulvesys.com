import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { UNIDAD } from '@prisma/client';
import { UUID } from 'crypto';

export class ProductoDTO {
  @IsOptional()
  id: UUID;

  @IsString()
  nombre: string;

  @IsEnum(UNIDAD)
  unidad: UNIDAD;

  @IsNumber()
  cantidad: number;
}
