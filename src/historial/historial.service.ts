import { Log, Usuario } from '@prisma/client';

import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HistorialService {
  constructor(private prisma: PrismaService) {}

  async getAll(usuario_id: Usuario['id'], limitLastMonth: boolean) {
    return await this.prisma.log.findMany({
      where: {
        usuario_id,
        createdAt: {
          gte: limitLastMonth
            ? DateTime.now().minus({ months: 1 }).toUTC().toJSDate()
            : undefined,
        },
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            rol: true,
            empresa_id: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllByEmpresa(empresa_id: Usuario['id']) {
    const dataByEmployers = await this.prisma.log.findMany({
      where: { usuario: { empresa_id } },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            rol: true,
            empresa_id: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const dataByDeletedEmployes = await this.prisma.log.findMany({
      where: { usuario: null, empresa_id },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            rol: true,
            empresa_id: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const dataByMySelf = await this.getAll(empresa_id, false);
    const sortedData = [
      ...dataByEmployers,
      ...dataByDeletedEmployes,
      ...dataByMySelf,
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return sortedData;
  }

  async createLog(data: Log) {
    return await this.prisma.log.create({ data });
  }
}
