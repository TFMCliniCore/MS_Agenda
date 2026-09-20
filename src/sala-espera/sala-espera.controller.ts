import { Body, Controller, Delete, Get, Param, ParseIntPipe,
         Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger'; // 👈 Importación de Swagger
import { SalaEsperaService } from './sala-espera.service';
import { CreateSalaEsperaDto } from './dto/create-sala-espera.dto';
import { UpdateSalaEsperaDto } from './dto/update-sala-espera.dto';

@ApiTags('Flujo de Sala de Espera')
@Controller('sala-espera')
export class SalaEsperaController {
  constructor(private readonly salaEsperaService: SalaEsperaService) {}

  @Post()
  @ApiOperation({ summary: 'Ingresar a un paciente al flujo activo de la sala de espera' })
  create(@Body() dto: CreateSalaEsperaDto) {
    return this.salaEsperaService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Monitorear la sala de espera filtrando por fecha, estado de pago o alertas de llamado' })
  findAll(
    @Query('desde')      desde?: string,
    @Query('hasta')      hasta?: string,
    @Query('pago')       pago?: string,
    @Query('llamar')     llamar?: string,
    @Query('pacienteId') pacienteId?: string,
  ) {
    return this.salaEsperaService.findAll({
      desde,
      hasta,
      pacienteId: pacienteId ? Number(pacienteId) : undefined,
      pago:       pago   !== undefined ? pago   === 'true' : undefined,
      llamar:     llamar !== undefined ? llamar === 'true' : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar el estado del turno de un paciente específico en la sala' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salaEsperaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar el estado del paciente (Ej: si ya fue llamado o pasó a consulta)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSalaEsperaDto) {
    return this.salaEsperaService.update(id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Reemplazar por completo la información de turno del paciente en recepción' })
  replace(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSalaEsperaDto) {
    return this.salaEsperaService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover a un paciente del tablero de visualización de la sala' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.salaEsperaService.remove(id);
  }
}