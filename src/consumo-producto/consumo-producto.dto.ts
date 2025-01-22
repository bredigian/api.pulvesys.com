import { IsOptional, IsUUID } from 'class-validator';

import { UUID } from 'crypto';

export class ConsumoProductoDTO {
  @IsUUID()
  pulverizacion_id: UUID;

  @IsUUID()
  producto_id: UUID;

  @IsOptional()
  valor_teorico: number | null;

  @IsOptional()
  valor_real: number | null;

  @IsOptional()
  valor_devolucion: number | null;
}
