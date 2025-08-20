import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../../domain/exceptions/token.exception';
import { ErrorHandlerRegistry } from './error-handler.registry';

/**
 * ========================================
 * 🚨 EXCEPTION FILTER EXPLICADO:
 * ========================================
 * 
 * Un EXCEPTION FILTER es una clase especial de NestJS que captura excepciones
 * no manejadas y las convierte en respuestas HTTP estructuradas.
 * 
 * VENTAJAS:
 * ✅ Manejo centralizado de errores
 * ✅ Respuestas consistentes al cliente
 * ✅ Logging y monitoreo centralizados
 * ✅ Separación entre lógica de negocio y manejo de errores
 * 
 * FLUJO:
 * 1. Algo lanza una excepción en cualquier parte de la app
 * 2. NestJS captura la excepción automáticamente
 * 3. Busca el filter apropiado (@Catch)
 * 4. Ejecuta el método catch() del filter
 * 5. El filter envía respuesta HTTP al cliente
 * ========================================
 */

// IMPORTANTE: Este import ejecuta los decorators @ErrorHandler
// SIDE EFFECT IMPORT: Cuando Node.js carga este archivo, también carga token-error.handlers.ts
// Los decorators se ejecutan y registran automáticamente las clases en el Registry
import './handlers/token-error.handlers';

// FILTER PRINCIPAL: NestJS llama a este filter cuando hay una DomainException
@Catch(DomainException)  // "Capturar todas las excepciones que extiendan DomainException"
export class DomainExceptionFilter implements ExceptionFilter {
  
  // MÉTODO PRINCIPAL: Se ejecuta cada vez que hay una excepción del dominio
  catch(exception: DomainException, host: ArgumentsHost) {
    
    // PASO 1: Obtener objetos de contexto HTTP de NestJS
    const ctx = host.switchToHttp();              // Contexto HTTP
    const response = ctx.getResponse<Response>(); // Objeto Response de Express
    
    // PASO 2: Delegar al Registry para obtener status y errorCode
    // Aquí es donde se evita el if/else - el Registry encuentra automáticamente el handler
    const { status, errorCode } = ErrorHandlerRegistry.getErrorMapping(exception);
    // Ejemplo: si exception es TokenExpiredException, retorna { status: 401, errorCode: 'TOKEN_EXPIRED' }

    // PASO 3: Enviar respuesta HTTP estructurada al cliente
    response.status(status).json({
      error: true,                              // Indicar que es un error
      statusCode: status,                       // Código HTTP (401, 404, 500, etc.)
      errorCode,                                // Código específico para el frontend
      message: exception.message,               // Mensaje descriptivo del error
      timestamp: new Date().toISOString(),      // Cuándo ocurrió el error
    });
    
    // RESULTADO: El frontend recibe algo como:
    // {
    //   "error": true,
    //   "statusCode": 401,
    //   "errorCode": "TOKEN_EXPIRED",
    //   "message": "Token has expired",
    //   "timestamp": "2024-01-15T10:30:00.000Z"
    // }
  }
}