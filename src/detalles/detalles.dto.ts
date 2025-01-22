import { IsArray, IsNumber, IsOptional, IsUUID } from 'class-validator';

import { UUID } from 'crypto';

export class DetalleDTO {
  @IsOptional()
  id: UUID;

  @IsUUID()
  campo_id: UUID;

  @IsArray()
  lotes: string[];

  @IsNumber()
  hectareas: number;

  @IsUUID()
  cultivo_id: UUID;

  @IsUUID()
  tratamiento_id: UUID;
}
