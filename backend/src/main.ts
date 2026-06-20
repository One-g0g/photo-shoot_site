import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const nodeEnv = config.get<string>('NODE_ENV', 'development');
  const corsOrigin = config.get<string>('CORS_ORIGIN', 'http://localhost:3000');

  if (nodeEnv === 'development') {
    app.enableCors({ origin: true, credentials: true });
  } else {
    app.enableCors({
      origin: corsOrigin.split(',').map((value) => value.trim()),
      credentials: true,
    });
  }

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  const port = config.get<number>('PORT', 3001);
  await app.listen(port, '0.0.0.0');
}

bootstrap();
