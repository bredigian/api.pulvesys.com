import { IsNumber, IsOptional, IsUUID } from 'class-validator';

import { UUID } from 'crypto';

export class CoordinadaDTO {
  @IsOptional()
  id?: UUID;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsOptional()
  lote_id?: UUID;
}
