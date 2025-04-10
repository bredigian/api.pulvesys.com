import { IsEnum, IsNumber, IsUUID } from 'class-validator';
import { Plan, SUBSCRIPTION_MESSAGE, Usuario } from '@prisma/client';

export class SuscripcionDTO {
  @IsUUID()
  plan_id: Plan['id'];

  @IsNumber()
  valor_actual: Plan['valor'];
}

export class MessageInfoDTO {
  @IsEnum(SUBSCRIPTION_MESSAGE, {
    message: 'El valor recibido no es admitido.',
  })
  message_info: SUBSCRIPTION_MESSAGE;
}
