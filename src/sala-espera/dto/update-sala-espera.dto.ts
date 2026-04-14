import { PartialType } from '@nestjs/mapped-types';
import { CreateSalaEsperaDto } from './create-sala-espera.dto';

export class UpdateSalaEsperaDto extends PartialType(CreateSalaEsperaDto) {}