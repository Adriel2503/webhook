import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS
  app.enableCors();
  
  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  const logger = new Logger('Bootstrap');
  logger.log(`🚀 Webhook server running on: http://0.0.0.0:${port}`);
  logger.log(`📡 Webhook endpoint: http://0.0.0.0:${port}/webhook`);
}

bootstrap();
