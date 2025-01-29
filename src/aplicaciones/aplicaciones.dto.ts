import { IsNumber, IsOptional, IsUUID } from 'class-validator';

import { UUID } from 'crypto';

export class AplicacionDTO {
  @IsOptional()
  id: UUID;

  @IsOptional()
  pulverizacion_id: UUID;

  @IsUUID()
  producto_id: UUID;

  @IsNumber()
  dosis: number;
}

export class AplicacionConConsumoDTO extends AplicacionDTO {
  @IsOptional()
  @IsNumber()
  valor_real?: number;

  @IsUUID()
  consumo_id: UUID;
}
