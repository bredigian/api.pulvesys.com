import { IsNumber, IsUUID } from 'class-validator';
import { Plan, Usuario } from '@prisma/client';

export class SuscripcionDTO {
  @IsUUID()
  plan_id: Plan['id'];

  @IsNumber()
  valor_actual: Plan['valor'];
}
