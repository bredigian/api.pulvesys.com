import { IsNumber, IsOptional, IsUUID } from 'class-validator';

import { UUID } from 'crypto';

export class AplicacionDTO {
  @IsOptional()
  id: UUID;

  @IsUUID()
  producto_id: UUID;

  @IsNumber()
  dosis: number;
}
