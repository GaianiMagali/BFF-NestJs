import { Injectable, Inject } from '@nestjs/common';
import type { ITokenRepository } from '../../domain/repositories/token.repository';
import type { IExternalTokenRepository } from '../../domain/repositories/external-token.repository';
import { TokenValidationDomainService } from '../../domain/services/token-validation.domain-service';
import { TokenValidationResponseDto, UserInfoDto } from '../dtos/token-validation-response.dto';
import { MissingTokenException, InvalidTokenException, ExternalValidationException, UpstreamHttpException } from '../../domain/exceptions/token.exception';
import type { ILoggerPort } from '../../../../shared/domain/ports/logger.port';

/**
 * 🎯 USE CASE - Validación completa de token
 * 
 * ¿Qué es un Use Case en Clean Architecture/DDD?
 * - ORQUESTADOR que ejecuta una funcionalidad específica de la aplicación
 * - Contiene la LÓGICA DE APLICACIÓN (no de dominio ni de presentación)
 * - Coordina entre diferentes servicios de dominio, adapters y entidades
 * - Representa un "caso de uso" específico que el usuario puede hacer
 * - Es stateless y se enfoca en UN solo objetivo
 * 
 * ¿Por qué ValidateTokenUseCase es un Use Case?
 * - Representa la funcionalidad: "Como usuario, quiero validar mi token de acceso"
 * - Orquesta múltiples operaciones: validación local, reglas de negocio, validación externa
 * - NO contiene lógica de dominio (eso está en los Domain Services)
 * - NO maneja HTTP/presentación (eso está en los Controllers)
 * - Es reutilizable desde diferentes puntos de entrada (HTTP, GraphQL, CLI, etc.)
 * 
 * ALGORITMO DEL USE CASE:
 * 1. 🔍 Verificar que el token esté presente
 * 2. 📝 Parsear y validar formato del token (via Adapter)
 * 3. 🔧 Aplicar reglas de negocio (via Domain Service)
 * 4. 🌍 Validar con API externa (via Adapter)
 * 5. 📦 Armar respuesta para el cliente (via DTOs)
 * 6. 🚨 Manejar errores de forma consistente
 * 
 * PATRONES APLICADOS:
 * - Orchestration: coordina múltiples operaciones
 * - Dependency Injection: recibe todo lo que necesita via constructor
 * - Exception Handling: maneja diferentes tipos de errores
 * - DTO Pattern: usa DTOs para comunicarse con capas externas
 */
@Injectable()
export class ValidateTokenUseCase {
  constructor(
    @Inject('ITokenRepository')
    private readonly tokenRepository: ITokenRepository,           // 🔌 Para validar formato JWT
    @Inject('IExternalTokenRepository')
    private readonly externalTokenRepository: IExternalTokenRepository, // 🔌 Para validar con API externa
    private readonly tokenValidationDomainService: TokenValidationDomainService, // 🔧 Para reglas de negocio
    @Inject('ILoggerPort')
    private readonly logger: ILoggerPort,                                 // 🔌 Para logging
  ) {}

  /**
   * 🚀 MÉTODO PRINCIPAL - Ejecutar validación completa de token
   * 
   * Este es el "Entry Point" del use case. Implementa todo el flujo
   * de validación de principio a fin, orquestando diferentes servicios.
   * 
   * FLUJO DETALLADO:
   * 1. Guard: verificar token presente
   * 2. Adapter: parsear token JWT
   * 3. Domain Service: aplicar reglas de negocio
   * 4. Adapter: validar con sistema externo
   * 5. Builder: construir respuesta exitosa
   * 6. Handler: manejar errores específicos
   * 
   * ¿Por qué lanza excepciones en lugar de retornar Result<T, Error>?
   * - NestJS maneja excepciones automáticamente via Exception Filters
   * - Permite stack traces para debugging
   * - Integración nativa con HTTP status codes
   * - Código más limpio sin necesidad de validar Result en cada paso
   * 
   * @param tokenValue - Token JWT crudo del header Authorization
   * @returns DTO con información del usuario y token renovado
   * @throws MissingTokenException si no se proporciona token
   * @throws InvalidTokenException si el token es inválido
   * @throws TokenExpiredException si el token está expirado
   * @throws UpstreamHttpException si hay errores en API externa
   * @throws ExternalValidationException si falla la validación externa por motivos técnicos
   */
  async execute(tokenValue: string | undefined): Promise<TokenValidationResponseDto> {
    // 🚨 PASO 1: Guard - Verificar presencia del token
    if (!tokenValue) {
      this.logger.warn('Token validation attempted without token', 'ValidateTokenUseCase');
      throw new MissingTokenException();
    }

    this.logger.debug(`Starting token validation for token: ${tokenValue.substring(0, 20)}...`, 'ValidateTokenUseCase');

    // 🔍 PASO 2: Adapter - Parsear y validar formato JWT
    const token = await this.tokenRepository.validateToken(tokenValue);
    
    if (!token) {
      this.logger.warn('Token parsing failed - invalid format', 'ValidateTokenUseCase');
      throw new InvalidTokenException();
    }

    this.logger.debug(`Token parsed successfully for user: ${token.sub}`, 'ValidateTokenUseCase');

    // 🔧 PASO 3: Domain Service - Aplicar reglas de negocio
    // Nota: validateTokenBusinessRules lanza excepciones si falla
    // Retorna true solo si TODAS las reglas pasan
    const isValid = this.tokenValidationDomainService.validateTokenBusinessRules(token);
    
    // Esta línea no debería ejecutarse nunca porque el Domain Service lanza excepciones
    // Pero la dejamos por defensiva programming
    if (!isValid) {
      this.logger.error('Token validation failed - business rules not met', undefined, 'ValidateTokenUseCase');
      throw new InvalidTokenException(); // Fallback, no debería llegar aquí
    }

    // 🌍 PASO 4: Adapter - Validar con API externa y renovar token
    try {
      const validatedToken = await this.externalTokenRepository.validateAndRenewToken(tokenValue);
      
      // 📦 PASO 5: Builder - Construir respuesta exitosa
      const userInfo = new UserInfoDto(
        token.sub,
        token.username
      );
      
      this.logger.log(`Token validation completed successfully for user: ${token.sub}`, 'ValidateTokenUseCase');
      return new TokenValidationResponseDto(
        'Validación de token exitosa',
        userInfo,
        validatedToken
      );
      
    } catch (error: unknown) {
      // 🚨 PASO 6: Exception Handler - Manejar errores de API externa
      
      // Caso 1: Error específico de API externa (preservar información de status/message)
      if (error instanceof UpstreamHttpException) {
        this.logger.error(`Upstream API error: ${error.status} - ${error.message}`, undefined, 'ValidateTokenUseCase');
        throw error; // Propagar tal como está para que los filtros la manejen
      }
      
      // Caso 2: Error técnico genérico (red, timeout, etc.)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('External token validation failed', error instanceof Error ? error.stack : undefined, 'ValidateTokenUseCase');
      throw new ExternalValidationException(errorMessage);
    }
  }

  /**
   * 🔍 MÉTODO FUTURO - Validar contexto adicional (ejemplo de extensibilidad)
   * 
   * Este método muestra cómo se podría extender el use case para validar
   * información adicional como IP, User-Agent, etc.
   */
  // private async validateRequestContext(token: Token, context: RequestContext): Promise<void> {
  //   if (context.ipAddress && !this.isValidIpAddress(context.ipAddress, token.allowedIps)) {
  //     throw new UnauthorizedIpException();
  //   }
  //   
  //   if (context.userAgent && this.isSuspiciousUserAgent(context.userAgent)) {
  //     this.logger.warn(`Suspicious user agent detected: ${context.userAgent}`, 'ValidateTokenUseCase');
  //   }
  // }
}