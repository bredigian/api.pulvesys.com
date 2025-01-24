import { IsOptional, IsString, IsUUID } from 'class-validator';

import { UUID } from 'crypto';

export class CultivoStrictDTO {
  @IsUUID()
  id: UUID;

  @IsString()
  nombre: string;
}

export class CultivoDTO {
  @IsOptional()
  id: UUID;

  @IsString()
  nombre: string;
}
