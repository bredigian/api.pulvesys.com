import { IsString } from 'class-validator';

export class AuthDto {
  @IsString()
  nombre_usuario: string;

  @IsString()
  contrasena: string;
}
