import { USUARIO_ROL } from '@prisma/client';
import { IsEnum, IsPhoneNumber, IsString } from 'class-validator';

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

  @IsEnum(USUARIO_ROL)
  rol: USUARIO_ROL;
}
