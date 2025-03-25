import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  InternalServerErrorException,
  Post,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Version,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from 'src/auth/auth.dto';
import { HashService } from 'src/lib/hash.service';
import { AuthService } from 'src/auth/auth.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly service: UsuariosService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
  ) {}

  @Get('empresa')
  @Version('1')
  @UseGuards(AuthGuard)
  async getUsuariosByEnterpriseId(
    @Res() response: Response,
    @Headers('Authorization') authorization: string,
  ) {
    try {
      const { sub: empresa_id } = await this.jwtService.decode(
        authorization?.substring(7),
      );

      const data = await this.service.getAllByEmpresaId(empresa_id);
      console.log(data);
      return response.json(data);
    } catch (e) {
      if (e) throw e;

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }

  @Version('1')
  @Post('empresa')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createUsuario(
    @Headers('Authorization') authorization: string,
    @Body() payload: SignupDto,
    @Res() response: Response,
  ) {
    try {
      const { sub: empresa_id } = await this.jwtService.decode(
        authorization.substring(7),
      );
      const { contrasena, rol: payloadRol } = payload;
      if (payloadRol === 'ADMIN')
        throw new ForbiddenException('El rol recibido no está habilitado.');

      const hashedPassword = await this.hashService.generateHash(contrasena);
      const createdUser = await this.service.createUser({
        ...payload,
        contrasena: hashedPassword,
        empresa_id,
      });

      return response.json(createdUser);
    } catch (e) {
      if (e) {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === 'P2002')
            throw new ConflictException('El usuario ya existe.');
          throw e;
        }

        throw e;
      }

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }
}
