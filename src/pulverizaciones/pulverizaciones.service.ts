import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PulverizacionBaseDTO } from './pulverizaciones.dto';
import { UUID } from 'crypto';

@Injectable()
export class PulverizacionesService {
  constructor(private prisma: PrismaService) {}

  async createPulverizacion(data: PulverizacionBaseDTO) {
    return await this.prisma.pulverizacion.create({ data });
  }

  async deleteById(id: UUID) {
    return await this.prisma.pulverizacion.delete({ where: { id } });
  }
}
