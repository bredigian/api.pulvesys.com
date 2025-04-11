import {
  Controller,
  Get,
  Headers,
  InternalServerErrorException,
  Res,
  UseGuards,
  Version,
} from '@nestjs/common';
import { HistorialService } from './historial.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Controller('historial')
export class HistorialController {
  constructor(
    private readonly service: HistorialService,
    private readonly jwtService: JwtService,
    private readonly usuariosService: UsuariosService,
  ) {}

  @Get()
  @Version('1')
  @UseGuards(AuthGuard)
  async getAll(
    @Res() response: Response,
    @Headers('Authorization') authorization: string,
  ) {
    try {
      const { sub: usuario_id } = await this.jwtService.decode(
        authorization.substring(7),
      );
      const { id, rol, empresa_id } =
        await this.usuariosService.findById(usuario_id);

      const isIndividualPlan = rol === 'INDIVIDUAL' && !empresa_id;

      const data =
        rol === 'EMPRESA'
          ? await this.service.getAllByEmpresa(id)
          : await this.service.getAll(id, isIndividualPlan);

      return response.json(data);
    } catch (e) {
      if (e) throw e;

      throw new InternalServerErrorException(
        'Se produjo un error interno en el servidor.',
      );
    }
  }
}
