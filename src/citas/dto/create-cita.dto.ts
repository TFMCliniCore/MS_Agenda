import { IsDateString, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCitaDto {
  @IsDateString()
  fecha!: string;

  @IsString()
  @MaxLength(500)
  motivo!: string;

  @IsString()
  @MaxLength(50)
  tipo!: string;

  @IsInt()
  pacienteId!: number;

  @IsOptional()
  @IsInt()
  usuarioId?: number;

  @IsOptional()
  @IsInt()
  recordatorioId?: number;
}