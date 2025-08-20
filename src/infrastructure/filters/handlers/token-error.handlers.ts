import { HttpStatus } from '@nestjs/common';
import { 
  TokenExpiredException, 
  InvalidTokenException, 
  TokenNotFoundException,
  DomainException 
} from '../../../domain/exceptions/token.exception';
import { ErrorHandler } from '../error-handler.registry';

/**
 * ========================================
 * 🔧 CAPA INFRASTRUCTURE EXPLICADA:
 * ========================================
 * 
 * La capa INFRASTRUCTURE contiene adaptadores que conectan nuestra aplicación
 * con el mundo exterior: bases de datos, APIs, servicios web, etc.
 * 
 * RESPONSABILIDADES:
 * 🔌 Adapters: Conectan con servicios externos (JWT, HTTP, DB)
 * 🛡️ Guards: Protegen endpoints (autenticación, autorización)
 * 🚨 Filters: Manejan errores globalmente
 * 🔄 Interceptors: Transforman requests/responses
 * 
 * EN ESTE ARCHIVO:
 * Definimos handlers específicos para cada tipo de error de tokens.
 * Cada handler sabe cómo convertir una excepción del dominio en una respuesta HTTP.
 * ========================================
 */

// HANDLER 1: Para cuando el token está vencido
// El decorator @ErrorHandler se ejecuta cuando Node.js carga este archivo
// Automáticamente registra esta clase en el Registry para manejar TokenExpiredException
@ErrorHandler({
  exceptionType: TokenExpiredException,    // "Si llega TokenExpiredException, usar esta clase"
  httpStatus: HttpStatus.UNAUTHORIZED,     // "Retornar HTTP 401"
  errorCode: 'TOKEN_EXPIRED'               // "Enviar código 'TOKEN_EXPIRED' al frontend"
})
export class TokenExpiredHandler {
  // Verificar si esta clase puede manejar la excepción dada
  canHandle(exception: DomainException): boolean {
    return exception instanceof TokenExpiredException;  // Sí, si es TokenExpiredException
  }

  // ¿Qué código HTTP retornar?
  getHttpStatus(): HttpStatus {
    return HttpStatus.UNAUTHORIZED;  // 401 - No autorizado
  }

  // ¿Qué código de error enviar al frontend?
  getErrorCode(): string {
    return 'TOKEN_EXPIRED';  // El frontend puede mostrar "Su sesión ha expirado"
  }
}

// HANDLER 2: Para cuando el token está malformado o es inválido
@ErrorHandler({
  exceptionType: InvalidTokenException,    // "Si llega InvalidTokenException, usar esta clase"
  httpStatus: HttpStatus.UNAUTHORIZED,     // "Retornar HTTP 401"
  errorCode: 'INVALID_TOKEN'               // "Enviar código 'INVALID_TOKEN' al frontend"
})
export class InvalidTokenHandler {
  // ¿Puede manejar InvalidTokenException?
  canHandle(exception: DomainException): boolean {
    return exception instanceof InvalidTokenException;  // Sí
  }

  // Código HTTP
  getHttpStatus(): HttpStatus {
    return HttpStatus.UNAUTHORIZED;  // 401
  }

  // Código para el frontend
  getErrorCode(): string {
    return 'INVALID_TOKEN';  // El frontend puede mostrar "Token inválido"
  }
}

// HANDLER 3: Para cuando no se envía el header Authorization
@ErrorHandler({
  exceptionType: TokenNotFoundException,   // "Si llega TokenNotFoundException, usar esta clase"
  httpStatus: HttpStatus.UNAUTHORIZED,     // "Retornar HTTP 401"
  errorCode: 'TOKEN_NOT_PROVIDED'          // "Enviar código 'TOKEN_NOT_PROVIDED' al frontend"
})
export class TokenNotFoundHandler {
  // ¿Puede manejar TokenNotFoundException?
  canHandle(exception: DomainException): boolean {
    return exception instanceof TokenNotFoundException;  // Sí
  }

  // Código HTTP
  getHttpStatus(): HttpStatus {
    return HttpStatus.UNAUTHORIZED;  // 401
  }

  // Código para el frontend
  getErrorCode(): string {
    return 'TOKEN_NOT_PROVIDED';  // El frontend puede mostrar "Debe iniciar sesión"
  }
}