import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { Token } from '../../domain/entities/token.entity';
import { ValidateTokenUseCase } from '../../application/use-cases/validate-token.use-case';
import type { ITokenRepository } from '../../domain/repositories/token.repository';

/**
 * ========================================
 * 🛡️ GUARD PATTERN EXPLICADO:
 * ========================================
 * 
 * Un GUARD es un mecanismo de NestJS que decide si un request
 * puede acceder a un endpoint específico. Actúa como un "portero".
 * 
 * CUÁNDO SE EJECUTA:
 * 1. Request llega al servidor
 * 2. NestJS ejecuta TODOS los guards del endpoint
 * 3. Si TODOS retornan true → continúa al controller
 * 4. Si ALGUNO retorna false → bloquea y retorna 403
 * 5. Si lanza excepción → la captura el Exception Filter
 * 
 * VENTAJAS:
 * ✅ Protección automática de endpoints
 * ✅ Lógica de autenticación centralizada
 * ✅ Reutilizable en múltiples controllers
 * ✅ Inyección de datos en el request
 * 
 * DIFERENCIA CON MIDDLEWARE:
 * - Middleware: Se ejecuta antes de TODA la aplicación
 * - Guard: Se ejecuta antes de ENDPOINTS ESPECÍFICOS
 * ========================================
 */

// EXTENSIÓN DE REQUEST: Define qué información adicional
// el guard inyectará en el objeto request para usar en el controller
interface RequestWithTokenData extends Request {
  user: Token;            // Token decodificado y validado
  validatedToken: string; // Token validado por la API externa
}

/**
 * ========================================
 * 🔧 CAPA INFRASTRUCTURE - GUARD
 * ========================================
 * 
 * Los GUARDS forman parte de la capa de infraestructura porque:
 * - Manejan aspectos técnicos (HTTP headers, autenticación)
 * - No contienen lógica de negocio pura
 * - Se conectan con casos de uso de la capa de aplicación
 * - Protegen la entrada a nuestro dominio
 * ========================================
 */
@Injectable()  // DECORATOR: Marca la clase como inyectable por el DI de NestJS
export class TokenValidationGuard implements CanActivate {
  
  // DEPENDENCY INJECTION: NestJS inyecta automáticamente el caso de uso
  // El constructor recibe las dependencias que la clase necesita
  constructor(
    private readonly validateTokenUseCase: ValidateTokenUseCase,
    @Inject('ITokenRepository')
    private readonly tokenRepository: ITokenRepository,
  ) {}

  /**
   * ========================================
   * 🔑 MÉTODO CANACTIVATE - CORAZÓN DEL GUARD
   * ========================================
   * 
   * Este método decide si el request puede continuar al controller.
   * NestJS lo llama automáticamente cuando se accede a un endpoint protegido.
   * 
   * RETURN VALUES:
   * - true: Request permitido → continúa al controller
   * - false: Request bloqueado → NestJS retorna 403 Forbidden
   * - Exception: Error → Exception Filter maneja la respuesta
   * 
   * EXECUTION CONTEXT:
   * Objeto de NestJS que contiene información sobre el request actual:
   * - HTTP request/response
   * - Controller y método que se va a ejecutar
   * - Metadata de decorators
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // PASO 1: Obtener el objeto Request HTTP del contexto
    // ExecutionContext es una abstracción, switchToHttp() nos da el contexto HTTP
    const request = context.switchToHttp().getRequest<RequestWithTokenData>();
    
    // PASO 2: Extraer el token del header Authorization
    // Busca el patrón: "Authorization: Bearer <token>"
    const token = this.extractTokenFromHeader(request);

    // PASO 3: Delegar la validación al caso de uso de la capa Application
    // IMPORTANTE: El guard NO hace validación directa, delega al caso de uso
    // Esto mantiene la separación de responsabilidades de la arquitectura hexagonal
    try {
      const validatedToken = await this.validateTokenUseCase.execute(token);
      
      // PASO 4: Si la validación es exitosa, INYECTAR datos en el request
      // REQUEST ENHANCEMENT: Agregar información para que el controller la use
      // Decodificar el token original para obtener información básica
      const decodedToken = await this.tokenRepository.validateToken(token!);
      
      if (decodedToken) {
        request.user = decodedToken;          // Token decodificado
        request.validatedToken = validatedToken; // Token validado por API externa
        return true;  // ✅ PERMITIR acceso al endpoint
      }
      
      return false;  // ❌ DENEGAR acceso al endpoint
    } catch (error) {
      // Las excepciones específicas las maneja el Exception Filter global
      throw error;
    }
  }

  /**
   * ========================================
   * 📤 EXTRACCIÓN DE TOKEN DEL HEADER
   * ========================================
   * 
   * Método utilitario que extrae el token JWT del header Authorization.
   * Maneja el formato estándar: "Authorization: Bearer <token>"
   * 
   * FORMATOS SOPORTADOS:
   * ✅ "Bearer eyJhbGciOiJIUzI1NiIsInR..." → extrae el token
   * ❌ "Basic dXNlcjpwYXNz"              → retorna undefined
   * ❌ "eyJhbGciOiJIUzI1NiIsInR..."      → retorna undefined (falta "Bearer")
   * ❌ Header no presente                 → retorna undefined
   * 
   * DESTRUCTURING EXPLICADO:
   * "Bearer token123".split(' ') → ["Bearer", "token123"]
   * const [type, token] = ["Bearer", "token123"]
   * type = "Bearer", token = "token123"
   */
  private extractTokenFromHeader(request: RequestWithTokenData): string | undefined {
    // NULLISH COALESCING (??): Si authorization es null/undefined, usa array vacío
    // OPTIONAL CHAINING (?.): Si headers es null/undefined, no explota
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    
    // CONDITIONAL RETURN: Solo retorna el token si el tipo es "Bearer"
    return type === 'Bearer' ? token : undefined;
  }
}

/**
 * ========================================
 * 🔄 FLUJO COMPLETO DEL GUARD:
 * ========================================
 * 
 * 1. 📨 Cliente envía: GET /api con Header "Authorization: Bearer <token>"
 * 2. 🛡️ NestJS ejecuta TokenValidationGuard.canActivate()
 * 3. 📤 Guard extrae token del header Authorization
 * 4. 🔍 Guard llama a ValidateTokenUseCase.execute(token)
 * 5. ⚡ UseCase valida token y llama APIs externas
 * 6. ✅ Si válido: Guard inyecta datos en request y retorna true
 * 7. 🎯 Controller recibe request con datos inyectados
 * 8. 📋 Controller retorna respuesta usando datos del guard
 * 
 * 🚨 SI HAY ERROR:
 * - UseCase lanza excepción (TokenExpiredException, etc.)
 * - Exception Filter captura la excepción
 * - Filter retorna error HTTP estructurado al cliente
 * ========================================
 */