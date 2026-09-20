import { Body, Controller, Delete, Get, Param, ParseIntPipe,
         Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger'; // 👈 Importación de Swagger
import { RecordatoriosService } from './recordatorios.service';
import { CreateRecordatorioDto } from './dto/create-recordatorio.dto';
import { UpdateRecordatorioDto } from './dto/update-recordatorio.dto';

@ApiTags('Recordatorios y Notificaciones')
@Controller('recordatorios')
export class RecordatoriosController {
  constructor(private readonly recordatoriosService: RecordatoriosService) {}

  @Post()
  @ApiOperation({ summary: 'Programar un nuevo recordatorio de cita para un paciente' })
  create(@Body() dto: CreateRecordatorioDto) {
    return this.recordatoriosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Consultar el historial y estado de envío de las notificaciones programadas' })
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
  @ApiOperation({ summary: 'Obtener la información de un registro de recordatorio específico' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recordatoriosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar parcialmente el contenido o la fecha de un recordatorio' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRecordatorioDto) {
    return this.recordatoriosService.update(id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Sobreescribir completamente los parámetros de una notificación' })
  replace(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRecordatorioDto) {
    return this.recordatoriosService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar o eliminar una alerta de recordatorio' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.recordatoriosService.remove(id);
  }
}