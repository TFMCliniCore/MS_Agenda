import { Body, Controller, Delete, Get, Param, ParseIntPipe,
         Patch, Post, Put, Query } from '@nestjs/common';
import { SalaEsperaService } from './sala-espera.service';
import { CreateSalaEsperaDto } from './dto/create-sala-espera.dto';
import { UpdateSalaEsperaDto } from './dto/update-sala-espera.dto';

@Controller('sala-espera')
export class SalaEsperaController {
  constructor(private readonly salaEsperaService: SalaEsperaService) {}

  @Post()
  create(@Body() dto: CreateSalaEsperaDto) {
    return this.salaEsperaService.create(dto);
  }

  @Get()
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salaEsperaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSalaEsperaDto) {
    return this.salaEsperaService.update(id, dto);
  }

  @Put(':id')
  replace(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSalaEsperaDto) {
    return this.salaEsperaService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.salaEsperaService.remove(id);
  }
}