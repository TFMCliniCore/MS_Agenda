import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { EntidadesClientModule } from './entidades-client/entidades-client.module';
import { CitasModule } from './citas/citas.module';
import { RecordatoriosModule } from './recordatorios/recordatorios.module';
import { SalaEsperaModule } from './sala-espera/sala-espera.module';

@Module({
  imports: [
    PrismaModule,
    EntidadesClientModule,
    CitasModule,
    RecordatoriosModule,
    SalaEsperaModule
  ]
})
export class AppModule {}
