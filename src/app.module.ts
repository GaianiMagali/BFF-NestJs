import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './presentation/controllers/auth.controller';
import { ValidateTokenUseCase } from './application/use-cases/validate-token.use-case';
import { GetDataUseCase } from './application/use-cases/get-data.use-case';
import { JwtAdapter } from './infrastructure/adapters/jwt.adapter';
import { DataApiAdapter } from './infrastructure/adapters/data-api.adapter';
import { TokenValidationAdapter } from './infrastructure/adapters/token-validation.adapter';
import { TokenValidationGuard } from './infrastructure/guards/token-validation.guard';
import { DomainExceptionFilter } from './infrastructure/filters/domain-exception.filter';

/**
 * MÓDULO PRINCIPAL DE LA APLICACIÓN
 * 
 * Este módulo configura toda la inyección de dependencias siguiendo
 * el patrón de Arquitectura Hexagonal (Domain-Driven Design)
 */
@Module({
  // Importar módulos necesarios
  imports: [HttpModule],
  
  // Controladores HTTP - Capa de Presentación
  controllers: [AuthController],
  
  providers: [
    // Casos de uso - Capa de Aplicación
    ValidateTokenUseCase,
    GetDataUseCase,
    
    // Implementación de repositorios - Capa de Infraestructura
    {
      provide: 'ITokenRepository',    // Interface del dominio
      useClass: JwtAdapter,           // Implementación concreta
    },
    
    // Adaptadores para APIs externas
    DataApiAdapter,
    TokenValidationAdapter,
    
    // Guards para proteger endpoints
    TokenValidationGuard,
    
    // Filtro global para manejo de excepciones del dominio
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
  
  // Servicios exportados para otros módulos
  exports: [TokenValidationGuard],
})
export class AppModule {}