import { Body, Controller, Delete, Get, Param, ParseIntPipe,
         Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger'; // 👈 Importación de Swagger
import { CitasService } from './citas.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';

@ApiTags('Gestión de Citas Médicas') // 👈 Agrupador para la UI
@Controller('citas')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()
  @ApiOperation({ summary: 'Reservar y agendar una nueva cita médica en el calendario' })
  create(@Body() dto: CreateCitaDto) {
    return this.citasService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar y filtrar citas médicas por rango de fechas, estado, paciente o tipo' })
  findAll(
    @Query('desde')      desde?: string,
    @Query('hasta')      hasta?: string,
    @Query('estado')     estado?: string,
    @Query('pacienteId') pacienteId?: string,
    @Query('tipo')       tipo?: string,
  ) {
    return this.citasService.findAll({
      desde, hasta, estado, tipo,
      pacienteId: pacienteId ? Number(pacienteId) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener los detalles específicos de una cita por su ID único' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.citasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar de forma parcial los datos o cambiar el estado de una cita' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCitaDto) {
    return this.citasService.update(id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Reemplazar por completo el registro de una cita existente' })
  replace(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCitaDto) {
    return this.citasService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar o remover una cita del calendario médico' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.citasService.remove(id);
  }
}