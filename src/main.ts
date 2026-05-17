import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Execução Service')
    .setDescription('Serviço de Execução e Produção — Oficina Mecânica Fase 4')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env.PORT ?? 3003;
  await app.listen(port);
  console.log(`Execução Service rodando na porta ${port}`);
  console.log(`Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();
