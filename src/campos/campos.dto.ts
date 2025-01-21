import { IsNumber, IsOptional, IsString } from 'class-validator';

import { UUID } from 'crypto';

export class CampoDTO {
  @IsOptional()
  id: UUID;

  @IsString()
  nombre: string;

  @IsNumber()
  hectareas: number;
}
