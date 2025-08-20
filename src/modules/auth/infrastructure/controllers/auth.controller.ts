import { Controller, Get, UseGuards, Req, Inject } from '@nestjs/common';
import { Request } from 'express';
import { TokenValidationGuard } from '../guards/token-validation.guard';
import { ValidateTokenUseCase } from '../../application/use-cases/validate-token.use-case';
import { TokenValidationResponseDto } from '../../application/dtos/token-validation-response.dto';
import type { ILoggerPort } from '../../../../shared/domain/ports/logger.port';

/**
 * 🔧 INTERFACE EXTENSION - Request con datos adicionales del Guard
 * 
 * Esta interface extiende el Request de Express para incluir datos
 * que el Guard agrega después de la validación inicial.
 * 
 * ¿Por qué extender Request?
 * - El Guard procesa el token y agrega datos útiles al request
 * - Evita re-procesar el token en el controller
 * - Mantiene type safety en TypeScript
 * - Sigue el patrón de middleware de Express/NestJS
 */
interface RequestWithTokenData extends Request {
  tokenValue: string;  // Token extraído del header Authorization por el Guard
}

/**
 * 📡 CONTROLLER - Punto de entrada HTTP para autenticación
 * 
 * ¿Qué es un Controller en Arquitectura Hexagonal?
 * - DRIVING ADAPTER que conecta HTTP con el dominio
 * - Punto de entrada desde el mundo exterior hacia el núcleo
 * - Traduce protocolos HTTP a llamadas de dominio (sin lógica de negocio)
 * - Implementa la interfaz HTTP pero delega toda la lógica a Use Cases
 * - Forma parte de la capa de Infrastructure (Adapters)
 * 
 * RESPONSABILIDADES del Controller:
 * - Definir rutas y métodos HTTP
 * - Extraer datos de la request (headers, body, params)
 * - Aplicar Guards y middlewares
 * - Ejecutar Use Cases
 * - Formatear respuestas HTTP
 * - NUNCA debe lanzar HttpException - deja que las excepciones de dominio burbujeen
 * 
 * PATRONES APLICADOS:
 * - Hexagonal Architecture: Driving Adapter que conecta HTTP con el dominio
 * - Dependency Injection: recibe Use Cases via DI
 * - Decorator Pattern: usa decorators de NestJS (@Get, @UseGuards, etc.)
 * - Adapter Pattern: traduce protocolos HTTP a llamadas de dominio
 * 
 * EJEMPLO DE REQUEST-RESPONSE:
 * 
 * REQUEST:
 * ```
 * GET / HTTP/1.1
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * ```
 * 
 * RESPONSE (exitosa):
 * ```
 * HTTP/1.1 200 OK
 * Content-Type: application/json
 * 
 * {
 *   "message": "Validación de token exitosa",
 *   "user": { "sub": "123", "username": "juan", "validated": true },
 *   "validatedToken": "renewed_eyJhbGciOiJ..."
 * }
 * ```
 * 
 * RESPONSE (error):
 * ```
 * HTTP/1.1 401 Unauthorized
 * Content-Type: application/json
 * 
 * {
 *   "error": true,
 *   "statusCode": 401,
 *   "errorCode": "TOKEN_EXPIRED",
 *   "message": "El token ha expirado",
 *   "layer": "Domain",
 *   "timestamp": "2025-01-20T10:30:00Z"
 * }
 * ```
 */
@Controller()  // Sin path = responde en la raíz del módulo (/)
export class AuthController {
  constructor(
    private readonly validateTokenUseCase: ValidateTokenUseCase,  // 🎯 Use Case para validar tokens
    @Inject('ILoggerPort')
    private readonly logger: ILoggerPort,                        // 🔌 Puerto para logging
  ) {}
  
  /**
   * 🌐 ENDPOINT - GET / (Validación de token)
   * 
   * FLUJO DEL REQUEST:
   * 1. 🛡️ Guard intercepta y valida que hay token en headers
   * 2. 🛡️ Guard extrae token y lo agrega al request como tokenValue
   * 3. 📡 Controller recibe request con tokenValue ya extraído
   * 4. 🎯 Controller ejecuta Use Case con el token
   * 5. 📦 Use Case retorna DTO con respuesta exitosa
   * 6. 📡 Controller retorna DTO (NestJS lo serializa automáticamente a JSON)
   * 
   * ¿Por qué es tan simple el controller?
   * - El Guard ya hizo la validación inicial
   * - El Use Case maneja toda la lógica compleja
   * - Los Exception Filters manejan los errores automáticamente
   * - El controller solo hace de "traductor" HTTP ↔ Use Case
   * 
   * DECORATORS APLICADOS:
   * - @Get(): Define que responde a GET requests en la ruta raíz
   * - @UseGuards(TokenValidationGuard): Aplica guard antes del método
   * - @Req(): Inyecta el objeto Request completo (con datos del Guard)
   * 
   * @param req - Request de Express con tokenValue agregado por el Guard
   * @returns Promise<TokenValidationResponseDto> - DTO con respuesta exitosa
   * 
   * ERRORES MANEJADOS AUTOMÁTICAMENTE (por Exception Filters):
   * - MissingTokenException → 401 Unauthorized
   * - InvalidTokenException → 401 Unauthorized  
   * - TokenExpiredException → 401 Unauthorized
   * - UpstreamHttpException → Status code específico
   * - ExternalValidationException → 503 Service Unavailable
   */
  @Get()
  @UseGuards(TokenValidationGuard)  // 🛡️ Guard ejecuta ANTES del método
  async validateToken(@Req() req: RequestWithTokenData): Promise<TokenValidationResponseDto> {
    // 📝 PRINCIPIO: Keep Controllers Thin
    // El controller NO valida, NO procesa, NO maneja errores
    // Solo ejecuta el Use Case y retorna el resultado
    // Toda la lógica compleja está en capas internas
    
    this.logger.debug('Processing token validation request', 'AuthController');
    
    // 🎯 Ejecutar Use Case con token extraído por el Guard
    // Si hay errores, los Exception Filters los manejarán automáticamente
    return await this.validateTokenUseCase.execute(req.tokenValue);
  }

  /**
   * 🔍 ENDPOINT FUTURO - GET /me (obtener info del usuario actual)
   * 
   * Ejemplo de cómo se vería otro endpoint usando el mismo Guard:
   */
  // @Get('me')
  // @UseGuards(TokenValidationGuard)
  // async getCurrentUser(@Req() req: RequestWithTokenData): Promise<UserInfoDto> {
  //   return await this.getCurrentUserUseCase.execute(req.tokenValue);
  // }
}