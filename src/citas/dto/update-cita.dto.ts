import { PartialType } from '@nestjs/mapped-types';
import { CreateCitaDto } from './create-cita.dto';
import { IsIn, IsOptional } from 'class-validator';

export class UpdateCitaDto extends PartialType(CreateCitaDto) {
  @IsOptional()
  @IsIn(['NO_COMPLETADO', 'COMPLETADO', 'CANCELADO'])
  estado?: string;
}