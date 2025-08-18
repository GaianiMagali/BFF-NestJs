import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * PUNTO DE ENTRADA DE LA APLICACIÓN BFF
 * 
 * Este archivo es donde comienza la ejecución de toda la aplicación.
 * Configura y levanta el servidor NestJS con todas sus dependencias.
 */
(async function bootstrap() {
  // Crear la aplicación NestJS con el módulo principal
  const app = await NestFactory.create(AppModule);
  
  // Configurar pipes globales para validación automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,      // Solo permite propiedades definidas en los DTOs
      forbidNonWhitelisted: true, // Rechaza propiedades no permitidas
      transform: true,      // Transforma automáticamente los tipos de datos
    }),
  );

  // Configurar prefijo global '/api' para todas las rutas
  app.setGlobalPrefix('api');

  // Configurar Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('BFF - Backend For Frontend')
    .setDescription('API del BFF para validación de tokens JWT con integración a APIs externas')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT Token',
        description: 'Ingrese su token JWT',
        in: 'header',
      },
      'JWT-auth'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Habilitar CORS para permitir requests desde el frontend
  app.enableCors();
  
  // Levantar el servidor en el puerto configurado
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 BFF is running on port ${port}`);
  console.log(`📡 API available at: http://localhost:${port}/api`);
  console.log(`📚 Swagger docs at: http://localhost:${port}/api/docs`);
})();