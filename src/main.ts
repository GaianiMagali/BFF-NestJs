
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { 
  GlobalExceptionFilter,
  DomainExceptionMapper,
  HttpExceptionMapper,
  DefaultExceptionMapper
} from './shared';
import { AuthExceptionMapper } from './modules/auth/infrastructure/exception-mappers/auth-exception.mapper';

dotenv.config();

(async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(
    new GlobalExceptionFilter(
      new AuthExceptionMapper(),
      new DomainExceptionMapper(),
      new HttpExceptionMapper(),
      new DefaultExceptionMapper()
    )
  );

  app.setGlobalPrefix('api');
  app.enableCors();
  
  const port = process.env.PORT || 3004;
  
  await app.listen(port);
  
  const logger = new (await import('@nestjs/common')).Logger('Bootstrap');
  logger.log(`🚀 BFF corriendo en puerto ${port}!`);
  logger.log(`📡 API disponible en: http://localhost:${port}/api`);
})();