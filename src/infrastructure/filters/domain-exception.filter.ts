import { 
  ExceptionFilter, 
  Catch, 
  ArgumentsHost, 
  HttpStatus 
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../../domain/exceptions/token.exception';
import { 
  TokenExpiredException, 
  InvalidTokenException, 
  TokenNotFoundException 
} from '../../domain/exceptions/token.exception';

/**
 * FILTRO GLOBAL DE EXCEPCIONES - Capa de Infraestructura
 * 
 * Captura todas las excepciones del dominio y las convierte en
 * respuestas HTTP estructuradas con códigos de error específicos.
 * Se ejecuta automáticamente cuando hay excepciones no capturadas.
 */
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  
  /**
   * Maneja las excepciones del dominio y las convierte en respuestas HTTP
   * @param exception - Excepción del dominio lanzada
   * @param host - Contexto de ejecución de NestJS
   */
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    // Mapear excepciones del dominio a códigos HTTP y errores específicos
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof TokenExpiredException) {
      status = HttpStatus.UNAUTHORIZED;
      errorCode = 'TOKEN_EXPIRED';
    } else if (exception instanceof InvalidTokenException) {
      status = HttpStatus.UNAUTHORIZED;
      errorCode = 'INVALID_TOKEN';
    } else if (exception instanceof TokenNotFoundException) {
      status = HttpStatus.UNAUTHORIZED;
      errorCode = 'TOKEN_NOT_PROVIDED';
    }

    // Respuesta estructurada para el frontend
    response.status(status).json({
      error: true,
      statusCode: status,
      errorCode,              // Código específico para el frontend
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}