import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EntidadesClientService } from '../entidades-client/entidades-client.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';

@Injectable()
export class CitasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entidades: EntidadesClientService,
  ) {}

  async create(dto: CreateCitaDto) {
    const paciente = await this.entidades.getPaciente(dto.pacienteId);
    if (dto.usuarioId) await this.entidades.getUsuario(dto.usuarioId);

    return this.prisma.cita.create({
      data: {
        ...dto,
        fecha: new Date(dto.fecha),
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
    const citas = await this.prisma.cita.findMany({
      where: {
        eliminado: false,
        ...(filters.desde    && { fecha: { gte: new Date(filters.desde) } }),
        ...(filters.hasta    && { fecha: { lte: new Date(filters.hasta) } }),
        ...(filters.estado   && { estado: filters.estado }),
        ...(filters.pacienteId && { pacienteId: Number(filters.pacienteId) }),
        ...(filters.tipo     && { tipo: filters.tipo }),
      },
      orderBy: { fecha: 'asc' },
    });

    if (citas.length === 0) return [];

    const pacienteIds = citas.map(c => c.pacienteId);
    const usuarioIds  = citas.map(c => c.usuarioId).filter((id): id is number => id !== null);

    const [pacientesMap, usuariosMap] = await Promise.all([
      this.entidades.getPacientesByIds(pacienteIds),
      this.entidades.getUsuariosByIds(usuarioIds),
    ]);

    return citas.map(cita => ({
      ...cita,
      paciente: pacientesMap.get(cita.pacienteId) ?? null,
      usuario: cita.usuarioId ? usuariosMap.get(cita.usuarioId) ?? null : null,
    }));
  }

  async findOne(id: number) {
    const cita = await this.getCitaOrFail(id);
    const [paciente, usuario] = await Promise.all([
      this.entidades.getPaciente(cita.pacienteId),
      cita.usuarioId ? this.entidades.getUsuario(cita.usuarioId) : Promise.resolve(null),
    ]);
    return { ...cita, paciente, usuario };
  }

  async update(id: number, dto: UpdateCitaDto) {
    await this.getCitaOrFail(id);
    if (dto.pacienteId) await this.entidades.getPaciente(dto.pacienteId);
    if (dto.usuarioId)  await this.entidades.getUsuario(dto.usuarioId);

    return this.prisma.cita.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.fecha && { fecha: new Date(dto.fecha) }),
      },
    });
  }

  async remove(id: number) {
    await this.getCitaOrFail(id);
    return this.prisma.cita.update({
      where: { id },
      data: { eliminado: true },
    });
  }

  private async getCitaOrFail(id: number) {
    const cita = await this.prisma.cita.findFirst({ where: { id, eliminado: false } });
    if (!cita) throw new NotFoundException(`Cita con id ${id} no encontrada.`);
    return cita;
  }
}