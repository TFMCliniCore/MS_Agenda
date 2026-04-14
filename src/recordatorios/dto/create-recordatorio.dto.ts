import { IsDateString, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRecordatorioDto {
  @IsString()
  @MaxLength(500)
  motivo!: string;

  @IsString()
  @MaxLength(50)
  tipo!: string;

  @IsDateString()
  fechaDesde!: string;

  @IsDateString()
  fechaHasta!: string;

  @IsInt()
  pacienteId!: number;

  @IsOptional()
  @IsInt()
  usuarioId?: number;

  @IsOptional()
  @IsInt()
  citaId?: number;
}