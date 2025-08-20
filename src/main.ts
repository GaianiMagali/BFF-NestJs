import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * PUNTO DE ENTRADA DE LA APLICACIÓN BFF - VERSIÓN SIN SWAGGER
 * 
 * Este archivo es donde comienza la ejecución de toda la aplicación.
 * Configuración mínima sin documentación automática para entornos de producción.
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

  // Habilitar CORS para permitir requests desde el frontend
  app.enableCors();
  
  // Levantar el servidor en el puerto configurado
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 BFF is running on port ${port}`);
  console.log(`📡 API available at: http://localhost:${port}/api`);
})();