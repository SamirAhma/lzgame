import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const corsOrigins = configService.get<string>('CORS_ORIGINS', 'http://localhost:3000,http://localhost:3001,http://localhost:3002');
  const origins = corsOrigins.split(',').map(origin => origin.trim());

  app.enableCors({
    origin: origins,
    credentials: true
  });

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
