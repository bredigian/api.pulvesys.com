import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Headers,
  InternalServerErrorException,
  Post,
  Put,
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
import { CreateUserDto, SignupDto, UpdateUserDto } from 'src/auth/auth.dto';
import { HashService } from 'src/lib/hash.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { HistorialService } from 'src/historial/historial.service';
import { Log, Usuario } from '@prisma/client';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly service: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly logService: HistorialService,
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
    @Body() payload: CreateUserDto,
    @Res() response: Response,
  ) {
    try {
      const { sub: empresa_id } = await this.jwtService.decode(
        authorization.substring(7),
      );

      const usuariosQuantity =
        await this.service.countAllByEmpresaId(empresa_id);

      const MAX_EMPLOYERS_ALLOWED = +process.env.MAX_EMPLOYERS_ALLOWED;

      // No deberia ser MAYOR O IGUAL ya que no deberia pasarse nunca pero de todas maneras se compara así por una futura excepción de cantidad de usuarios.
      if (usuariosQuantity >= MAX_EMPLOYERS_ALLOWED)
        throw new ConflictException(
          'Alcanzaste el límite máximo de usuarios permitidos.',
        );

      const { contrasena } = payload;

      const hashedPassword = await this.hashService.generateHash(contrasena);
      const createdUser = await this.service.createUser({
        ...payload,
        contrasena: hashedPassword,
        empresa_id,
        rol: 'INDIVIDUAL',
      });

      const PAYLOAD_LOG: Log = {
        usuario_id: empresa_id,
        empresa_id: null,
        type: 'USUARIO',
        description: `Se registró un nuevo usuario a nombre de ${createdUser.nombre} ${createdUser.apellido}.`,
        id: undefined,
        createdAt: undefined,
      };

      await this.logService.createLog(PAYLOAD_LOG);

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

  @Version('1')
  @Put('empresa')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateUsuario(
    @Headers('Authorization') authorization: string,
    @Body() payload: UpdateUserDto,
    @Res() response: Response,
  ) {
    try {
      const { sub: empresa_id } = await this.jwtService.decode(
        authorization.substring(7),
      );

      const { contrasena } = payload;

      const hashedPassword = await this.hashService.generateHash(contrasena);
      const updatedUser = await this.service.updateUser(empresa_id, {
        ...payload,
        contrasena: hashedPassword,
        empresa_id,
        rol: 'INDIVIDUAL',
      });

      const PAYLOAD_LOG: Log = {
        usuario_id: empresa_id,
        empresa_id: null,
        type: 'USUARIO',
        description: `Se modificó un usuario a nombre de ${updatedUser.nombre} ${updatedUser.apellido}.`,
        id: undefined,
        createdAt: undefined,
      };

      await this.logService.createLog(PAYLOAD_LOG);

      return response.json(updatedUser);
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

  @Version('1')
  @Delete('empresa')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async deleteById(
    @Headers('Authorization') authorization: string,
    @Body() payload: { id: Usuario['id'] },
    @Res() response: Response,
  ) {
    try {
      const { sub: empresa_id } = await this.jwtService.decode(
        authorization.substring(7),
      );

      const { id } = payload;

      const deleted = await this.service.deleteById(empresa_id, id);

      const PAYLOAD_LOG: Log = {
        usuario_id: empresa_id,
        empresa_id: null,
        type: 'USUARIO',
        description: `Se eliminó el usuario de ${deleted.nombre} ${deleted.apellido}.`,
        id: undefined,
        createdAt: undefined,
      };

      await this.logService.createLog(PAYLOAD_LOG);

      return response.json(deleted);
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
