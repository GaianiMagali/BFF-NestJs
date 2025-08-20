import { Injectable, Inject } from '@nestjs/common';
import { Token } from '../entities/token.entity';
import { TokenExpiredException, InvalidTokenClaimsException } from '../exceptions/token.exception';
import type { ILoggerPort } from '../../../../shared/domain/ports/logger.port';

/**
 * 🔧 DOMAIN SERVICE - Servicio de validación de tokens
 * 
 * ¿Qué es un Domain Service en DDD?
 * - Contiene LÓGICA DE NEGOCIO que no pertenece a una sola Entity/Value Object
 * - Realiza operaciones que involucran múltiples objetos del dominio
 * - No tiene estado (stateless) - solo contiene comportamiento
 * - Representa conceptos del dominio que son "acciones" o "procesos"
 * 
 * ¿Por qué TokenValidationDomainService es un Domain Service?
 * - La validación de reglas de negocio trasciende a una sola Entity
 * - Coordina múltiples validaciones sobre el Token
 * - Representa el proceso de negocio "validar token según reglas del dominio"
 * - Es stateless: cada validación es independiente
 * 
 * PATRÓN: Service Layer (Domain)
 * - Encapsula lógica de negocio compleja
 * - Usa entities/value objects pero no es ninguno de ellos
 * - Se inyecta donde se necesite la lógica de validación
 */
@Injectable()
export class TokenValidationDomainService {
  
  constructor(
    @Inject('ILoggerPort')
    private readonly logger: ILoggerPort  // 🔌 Puerto para logging
  ) {}
  
  /**
   * 🎯 MÉTODO PRINCIPAL - Validar reglas de negocio del token
   * 
   * Este método implementa el patrón "Fail Fast":
   * - Valida cada regla de negocio secuencialmente
   * - Lanza excepción inmediatamente al encontrar un error
   * - Solo retorna true si TODAS las reglas pasan
   * 
   * Reglas de negocio implementadas:
   * 1. El token no debe estar expirado
   * 2. El token debe tener todos los claims requeridos
   * 
   * ¿Por qué lanza excepciones en lugar de retornar false?
   * - Las excepciones llevan información específica del error
   * - Permite manejar cada tipo de error de forma diferente
   * - Sigue el principio "Tell, Don't Ask"
   * 
   * @param token - Entity Token a validar
   * @returns true si todas las reglas pasan
   * @throws TokenExpiredException si el token está expirado
   * @throws InvalidTokenClaimsException si faltan claims requeridos
   */
  validateTokenBusinessRules(token: Token): boolean {
    // 🔍 REGLA 1: Validar expiración
    if (token.isExpired()) {
      this.logger.warn(`Token expired for user: ${token.sub}`, 'TokenValidationDomainService');
      throw new TokenExpiredException();
    }

    // 🔍 REGLA 2: Validar claims requeridos
    if (!this.hasRequiredClaims(token)) {
      this.logger.warn(`Invalid token claims for user: ${token.sub}`, 'TokenValidationDomainService');
      throw new InvalidTokenClaimsException();
    }
    
    // ✅ Todas las reglas pasaron
    this.logger.log('Token validation successful - business rules passed', 'TokenValidationDomainService');
    return true;
  }

  /**
   * 🔒 MÉTODO PRIVADO - Validar presencia de claims requeridos
   * 
   * Este método implementa validaciones específicas de datos.
   * Es privado porque es un detalle de implementación de las reglas de negocio.
   * 
   * Claims validados:
   * - sub: ID del usuario (no nulo, no vacío)
   * - username: Nombre de usuario (no nulo, no vacío)  
   * - exp: Timestamp válido (mayor a 0)
   * - iss: Emisor del token (no nulo, no vacío)
   * 
   * @param token - Token a validar
   * @returns true si tiene todos los claims requeridos
   */
  private hasRequiredClaims(token: Token): boolean {
    return token.sub != null && 
           token.sub.trim() !== '' &&
           token.username != null && 
           token.username.trim() !== '' &&
           token.exp > 0 && 
           token.iss != null &&
           token.iss.trim() !== '';
  }

  /**
   * 🔍 MÉTODO ADICIONAL - Validar issuer específico (ejemplo de extensibilidad)
   * 
   * Ejemplo de cómo se pueden agregar más reglas de negocio específicas.
   * Esta podría ser una regla como "solo aceptar tokens de ciertos emisores".
   */
  private isValidIssuer(issuer: string): boolean {
    const validIssuers = ['auth-service', 'identity-provider'];
    return validIssuers.includes(issuer);
  }
}