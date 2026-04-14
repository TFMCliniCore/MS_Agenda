import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSalaEsperaDto {
  @IsDateString()
  hora!: string;

  @IsString()
  @MaxLength(500)
  motivo!: string;

  @IsOptional()
  @IsBoolean()
  pago?: boolean = false;

  @IsOptional()
  @IsBoolean()
  llamar?: boolean = false;

  @IsInt()
  pacienteId!: number;

  @IsOptional()
  @IsInt()
  usuarioId?: number;
}