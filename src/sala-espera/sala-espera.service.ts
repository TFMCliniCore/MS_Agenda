import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EntidadesClientService } from '../entidades-client/entidades-client.service';
import { CreateSalaEsperaDto } from './dto/create-sala-espera.dto';
import { UpdateSalaEsperaDto } from './dto/update-sala-espera.dto';

@Injectable()
export class SalaEsperaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entidades: EntidadesClientService,
  ) {}

  async create(dto: CreateSalaEsperaDto) {
    const paciente = await this.entidades.getPaciente(dto.pacienteId);
    if (dto.usuarioId) await this.entidades.getUsuario(dto.usuarioId);

    return this.prisma.salaEspera.create({
      data: {
        ...dto,
        hora: new Date(dto.hora),
        clienteId: paciente.cliente.id,
      },
    });
  }

  async findAll(filters: {
    desde?: string;
    hasta?: string;
    pago?: boolean;
    llamar?: boolean;
    pacienteId?: number;
  }) {
    const entradas = await this.prisma.salaEspera.findMany({
      where: {
        eliminado: false,
        ...(filters.desde      && { hora: { gte: new Date(filters.desde) } }),
        ...(filters.hasta      && { hora: { lte: new Date(filters.hasta) } }),
        ...(filters.pago       !== undefined && { pago: filters.pago }),
        ...(filters.llamar     !== undefined && { llamar: filters.llamar }),
        ...(filters.pacienteId && { pacienteId: Number(filters.pacienteId) }),
      },
      orderBy: { hora: 'asc' },
    });

    if (entradas.length === 0) return [];

    const pacienteIds = entradas.map(e => e.pacienteId);
    const usuarioIds  = entradas
      .map(e => e.usuarioId)
      .filter((id): id is number => id !== null);

    const [pacientesMap, usuariosMap] = await Promise.all([
      this.entidades.getPacientesByIds(pacienteIds),
      this.entidades.getUsuariosByIds(usuarioIds),
    ]);

    return entradas.map(e => ({
      ...e,
      paciente: pacientesMap.get(e.pacienteId) ?? null,
      usuario: e.usuarioId ? usuariosMap.get(e.usuarioId) ?? null : null,
    }));
  }

  async findOne(id: number) {
    const entrada = await this.getEntradaOrFail(id);

    const [paciente, usuario] = await Promise.all([
      this.entidades.getPaciente(entrada.pacienteId),
      entrada.usuarioId
        ? this.entidades.getUsuario(entrada.usuarioId)
        : Promise.resolve(null),
    ]);

    return { ...entrada, paciente, usuario };
  }

  async update(id: number, dto: UpdateSalaEsperaDto) {
    await this.getEntradaOrFail(id);

    if (dto.pacienteId) await this.entidades.getPaciente(dto.pacienteId);
    if (dto.usuarioId)  await this.entidades.getUsuario(dto.usuarioId);

    return this.prisma.salaEspera.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.hora && { hora: new Date(dto.hora) }),
      },
    });
  }

  async remove(id: number) {
    await this.getEntradaOrFail(id);
    return this.prisma.salaEspera.update({
      where: { id },
      data: { eliminado: true },
    });
  }

  private async getEntradaOrFail(id: number) {
    const entrada = await this.prisma.salaEspera.findFirst({
      where: { id, eliminado: false },
    });
    if (!entrada) {
      throw new NotFoundException(`Entrada de sala de espera con id ${id} no encontrada.`);
    }
    return entrada;
  }
}