import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Prefijo global para que existan /api/auth/login, /api/clientes, etc.
  app.setGlobalPrefix('api');

  // ✅ CORS (lee su .env: CORS_ORIGINS=http://localhost:4200,http://localhost:3000)
  const config = app.get(ConfigService);
  const originsRaw = config.get<string>('CORS_ORIGINS') ?? '';
  const origins = originsRaw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins.length ? origins : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ✅ Validación DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = Number(process.env.APP_PORT ?? 3000);
  await app.listen(port);
}
bootstrap();
