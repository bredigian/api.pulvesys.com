import { IsOptional, IsString, IsUUID } from 'class-validator';

import { UUID } from 'crypto';

export class TratamientoStrictDTO {
  @IsUUID()
  id: UUID;

  @IsString()
  nombre: string;
}

export class TratamientoDTO {
  @IsOptional()
  id: UUID;

  @IsString()
  nombre: string;
}
