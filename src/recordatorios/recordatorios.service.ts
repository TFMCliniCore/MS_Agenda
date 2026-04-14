import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EntidadesClientService } from '../entidades-client/entidades-client.service';
import { CreateRecordatorioDto } from './dto/create-recordatorio.dto';
import { UpdateRecordatorioDto } from './dto/update-recordatorio.dto';

@Injectable()
export class RecordatoriosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entidades: EntidadesClientService,
  ) {}

  async create(dto: CreateRecordatorioDto) {
    const paciente = await this.entidades.getPaciente(dto.pacienteId);
    if (dto.usuarioId) await this.entidades.getUsuario(dto.usuarioId);

    if (dto.citaId) await this.getCitaOrFail(dto.citaId);

    return this.prisma.recordatorio.create({
      data: {
        ...dto,
        fechaDesde: new Date(dto.fechaDesde),
        fechaHasta: new Date(dto.fechaHasta),
        clienteId: paciente.cliente.id,
        estado: 'NO_COMPLETADO',
      },
    });
  }

  async findAll(filters: {
    desde?: string;
    hasta?: string;
    estado?: string;
    pacienteId?: number;
    tipo?: string;
  }) {
    const recordatorios = await this.prisma.recordatorio.findMany({
      where: {
        eliminado: false,
        ...(filters.desde      && { fechaDesde: { gte: new Date(filters.desde) } }),
        ...(filters.hasta      && { fechaHasta: { lte: new Date(filters.hasta) } }),
        ...(filters.estado     && { estado: filters.estado }),
        ...(filters.pacienteId && { pacienteId: Number(filters.pacienteId) }),
        ...(filters.tipo       && { tipo: filters.tipo }),
      },
      orderBy: { fechaDesde: 'asc' },
    });

    if (recordatorios.length === 0) return [];

    const pacienteIds = recordatorios.map(r => r.pacienteId);
    const usuarioIds  = recordatorios
      .map(r => r.usuarioId)
      .filter((id): id is number => id !== null);

    const [pacientesMap, usuariosMap] = await Promise.all([
      this.entidades.getPacientesByIds(pacienteIds),
      this.entidades.getUsuariosByIds(usuarioIds),
    ]);

    return recordatorios.map(r => ({
      ...r,
      paciente: pacientesMap.get(r.pacienteId) ?? null,
      usuario: r.usuarioId ? usuariosMap.get(r.usuarioId) ?? null : null,
    }));
  }

  async findOne(id: number) {
    const recordatorio = await this.getRecordatorioOrFail(id);

    const [paciente, usuario] = await Promise.all([
      this.entidades.getPaciente(recordatorio.pacienteId),
      recordatorio.usuarioId
        ? this.entidades.getUsuario(recordatorio.usuarioId)
        : Promise.resolve(null),
    ]);

    return { ...recordatorio, paciente, usuario };
  }

  async update(id: number, dto: UpdateRecordatorioDto) {
    await this.getRecordatorioOrFail(id);

    if (dto.pacienteId) await this.entidades.getPaciente(dto.pacienteId);
    if (dto.usuarioId)  await this.entidades.getUsuario(dto.usuarioId);
    if (dto.citaId)     await this.getCitaOrFail(dto.citaId);

    return this.prisma.recordatorio.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.fechaDesde && { fechaDesde: new Date(dto.fechaDesde) }),
        ...(dto.fechaHasta && { fechaHasta: new Date(dto.fechaHasta) }),
      },
    });
  }

  async remove(id: number) {
    await this.getRecordatorioOrFail(id);
    return this.prisma.recordatorio.update({
      where: { id },
      data: { eliminado: true },
    });
  }

  private async getRecordatorioOrFail(id: number) {
    const recordatorio = await this.prisma.recordatorio.findFirst({
      where: { id, eliminado: false },
    });
    if (!recordatorio) {
      throw new NotFoundException(`Recordatorio con id ${id} no encontrado.`);
    }
    return recordatorio;
  }

  // Valida que la cita exista y no esté eliminada antes de asociarla
  private async getCitaOrFail(citaId: number) {
    const cita = await this.prisma.cita.findFirst({
      where: { id: citaId, eliminado: false },
    });
    if (!cita) {
      throw new NotFoundException(`Cita con id ${citaId} no encontrada.`);
    }
    return cita;
  }
}