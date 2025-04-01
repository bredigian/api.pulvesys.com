import { IsPhoneNumber, IsString, IsUUID } from 'class-validator';

import { Plan } from '@prisma/client';

export class AuthDto {
  @IsString()
  nombre_usuario: string;

  @IsString()
  contrasena: string;
}

export class SignupDto extends AuthDto {
  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsString()
  email: string;

  @IsPhoneNumber('AR')
  nro_telefono: string;

  @IsUUID()
  plan_id: Plan['id'];
}
