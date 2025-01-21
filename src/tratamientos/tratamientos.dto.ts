import { IsOptional, IsString } from 'class-validator';

import { UUID } from 'crypto';

export class TratamientoDTO {
  @IsOptional()
  id: UUID;

  @IsString()
  nombre: string;
}
