import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { LoggerServiceProvider } from './common/services/logger.service';
import { config } from './config/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Setup Logger
  const loggerService = app.get(LoggerServiceProvider);
  app.useLogger(loggerService);

  // Setup Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable CORS (optional)
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  await app.listen(config.app.port, () => {
    loggerService.log(
      `Application running on http://localhost:${config.app.port}`,
      'Bootstrap',
    );
    loggerService.log(`Environment: ${config.app.env}`, 'Bootstrap');
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
