import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; 
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './prisma/prisma-client-exception.filter';

async function bootstrap() {
  if (existsSync('.env')) loadEnvFile();

  const app = await NestFactory.create(AppModule);
  const httpAdapterHost = app.get(HttpAdapterHost);
  
  app.enableShutdownHooks();
  app.enableCors();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapterHost));

  // 👈 2. Configuración de Swagger para Agenda y Citas
  const config = new DocumentBuilder()
    .setTitle('CliniCore - MS Agenda y Citas')
    .setDescription('Endpoints para la gestión del calendario médico, asignación de turnos, estados de citas y recordatorios')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // 🎯 Expone Swagger en el prefijo que usará el Gateway proxy (ej: 'citas')
  SwaggerModule.setup('api/v1/citas/docs', app, document, {
    swaggerOptions: {
      jsonEditor: true,
    }
  });

  // Asegúrate de que el puerto coincida con tu mapeo de Docker Compose (por ejemplo, el 3003 o el asignado en tu .env)
  const port = Number(process.env.PORT ?? 3003);
  await app.listen(port, '0.0.0.0');
  console.log(`MS Agenda corriendo de forma segura en el puerto ${port}`);
}
void bootstrap();