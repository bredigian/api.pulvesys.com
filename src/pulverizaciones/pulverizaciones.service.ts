import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PulverizacionBaseDTO } from './pulverizaciones.dto';

@Injectable()
export class PulverizacionesService {
  constructor(private prisma: PrismaService) {}

  async createPulverizacion(data: PulverizacionBaseDTO) {
    return await this.prisma.pulverizacion.create({ data });
  }
}
