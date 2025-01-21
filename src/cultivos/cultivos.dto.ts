import { IsOptional, IsString } from 'class-validator';

import { UUID } from 'crypto';

export class CultivoDTO {
  @IsOptional()
  id: UUID;

  @IsString()
  nombre: string;
}
