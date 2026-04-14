import { Body, Controller, Delete, Get, Param, ParseIntPipe,
         Patch, Post, Put, Query } from '@nestjs/common';
import { RecordatoriosService } from './recordatorios.service';
import { CreateRecordatorioDto } from './dto/create-recordatorio.dto';
import { UpdateRecordatorioDto } from './dto/update-recordatorio.dto';

@Controller('recordatorios')
export class RecordatoriosController {
  constructor(private readonly recordatoriosService: RecordatoriosService) {}

  @Post()
  create(@Body() dto: CreateRecordatorioDto) {
    return this.recordatoriosService.create(dto);
  }

  @Get()
  findAll(
    @Query('desde')      desde?: string,
    @Query('hasta')      hasta?: string,
    @Query('estado')     estado?: string,
    @Query('pacienteId') pacienteId?: string,
    @Query('tipo')       tipo?: string,
  ) {
    return this.recordatoriosService.findAll({
      desde, hasta, estado, tipo,
      pacienteId: pacienteId ? Number(pacienteId) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recordatoriosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRecordatorioDto) {
    return this.recordatoriosService.update(id, dto);
  }

  @Put(':id')
  replace(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRecordatorioDto) {
    return this.recordatoriosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.recordatoriosService.remove(id);
  }
}