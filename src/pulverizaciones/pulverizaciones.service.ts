import { Pulverizacion, Usuario } from '@prisma/client';

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UUID } from 'crypto';

@Injectable()
export class PulverizacionesService {
  constructor(private prisma: PrismaService) {}

  async getPulverizaciones(usuario_id: Usuario['id']) {
    return await this.prisma.pulverizacion.findMany({
      where: { usuario_id },
      include: {
        detalle: {
          include: {
            campo: { include: { Lote: true } },
            cultivo: true,
            tratamiento: true,
          },
        },
        Aplicacion: { include: { producto: true } },
        ConsumoProducto: true,
        productos: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPulverizacionesByEmpresa(empresa_id: Usuario['id']) {
    const dataByEmployers = await this.prisma.pulverizacion.findMany({
      where: { usuario: { empresa_id } },
      include: {
        detalle: {
          include: {
            campo: { include: { Lote: true } },
            cultivo: true,
            tratamiento: true,
          },
        },
        usuario: {
          select: {
            id: true,
            empresa_id: true,
            nombre: true,
            apellido: true,
            rol: true,
          },
        },
        Aplicacion: { include: { producto: true } },
        ConsumoProducto: true,
        productos: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const dataByMySelf = await this.getPulverizaciones(empresa_id);

    const sortedData = [...dataByEmployers, ...dataByMySelf].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return sortedData;
  }

  async getById(id: Pulverizacion['id'], usuario_id: Usuario['id']) {
    return await this.prisma.pulverizacion.findUnique({
      where: { id, usuario_id },
      include: {
        detalle: {
          include: {
            campo: { include: { Lote: { include: { Coordinada: true } } } },
            cultivo: true,
            tratamiento: true,
          },
        },
        Aplicacion: { include: { producto: true } },
        ConsumoProducto: true,
        productos: true,
      },
    });
  }

  async getByIdByEmpresa(id: Pulverizacion['id'], empresa_id: Usuario['id']) {
    const data = await this.prisma.pulverizacion.findUnique({
      where: {
        id,
        usuario: { empresa_id },
      },
      include: {
        detalle: {
          include: {
            campo: { include: { Lote: { include: { Coordinada: true } } } },
            cultivo: true,
            tratamiento: true,
          },
        },
        usuario: {
          select: {
            id: true,
            empresa_id: true,
            nombre: true,
            apellido: true,
            rol: true,
          },
        },
        Aplicacion: { include: { producto: true } },
        ConsumoProducto: true,
        productos: true,
      },
    });
    if (!data) return await this.getById(id, empresa_id);

    return data;
  }

  async createPulverizacion(data: Pulverizacion) {
    return await this.prisma.pulverizacion.create({ data });
  }

  async updatePulverizacion(id: UUID) {
    return await this.prisma.pulverizacion.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
  }

  async deleteById(id: Pulverizacion['id'], usuario_id: Usuario['id']) {
    return await this.prisma.pulverizacion.delete({
      where: { id, usuario_id },
    });
  }

  async deleteByEmpresaById(
    id: Pulverizacion['id'],
    empresa_id: Usuario['id'],
  ) {
    const deleted = await this.prisma.pulverizacion.delete({
      where: { id, usuario: { empresa_id } },
    });
    if (!deleted) return await this.deleteById(id, empresa_id);

    return deleted;
  }
}
