import { PartialType } from '@nestjs/mapped-types';
import { CreateRecordatorioDto } from './create-recordatorio.dto';
import { IsIn, IsOptional } from 'class-validator';

export class UpdateRecordatorioDto extends PartialType(CreateRecordatorioDto) {
  @IsOptional()
  @IsIn(['NO_COMPLETADO', 'COMPLETADO', 'CANCELADO'])
  estado?: string;
}