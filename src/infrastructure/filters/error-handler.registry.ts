import { HttpStatus, Type } from '@nestjs/common';
import { DomainException } from '../../domain/exceptions/token.exception';

/**
 * ========================================
 * DEFINICIONES IMPORTANTES:
 * ========================================
 * 
 * 📋 DTO (Data Transfer Object): Objeto que transporta datos entre capas.
 *    Ejemplo: ValidateTokenResponseDto - define la estructura de respuesta del endpoint
 * 
 * 🎯 DECORATOR: Función que modifica clases, métodos o propiedades usando @.
 *    Ejemplo: @ErrorHandler - registra automáticamente una clase para manejar errores
 * 
 * 🗂️ REGISTRY PATTERN: Almacén central que guarda y busca objetos por clave.
 *    Ejemplo: Map que guarda "TokenExpiredException" → TokenExpiredHandler
 * 
 * 🏗️ ARQUITECTURA HEXAGONAL - CAPAS:
 *    📊 DOMAIN: Entidades y reglas de negocio (Token, excepciones)
 *    📋 APPLICATION: Casos de uso y DTOs (ValidateTokenUseCase)
 *    🎨 PRESENTATION: Controllers y endpoints HTTP (AuthController)
 *    🔧 INFRASTRUCTURE: Adaptadores externos (JWT, HTTP, Base de datos)
 * ========================================
 */

// PASO 1: Definir qué puede hacer un manejador de error
// INTERFACE: Contrato que define métodos que una clase debe implementar
interface ErrorHandler {
  canHandle(exception: DomainException): boolean;  // ¿Puede manejar esta excepción?
  getHttpStatus(): HttpStatus;                     // ¿Qué código HTTP retornar? (401, 404, etc.)
  getErrorCode(): string;                          // ¿Qué código de error? ('TOKEN_EXPIRED', etc.)
}

// PASO 2: Definir qué información necesita el decorator
// METADATA: Información adicional que se adjunta a clases/métodos para configurarlos
interface ErrorHandlerMetadata {
  exceptionType: Type<DomainException>;  // Tipo de excepción a manejar (TokenExpiredException)
  httpStatus: HttpStatus;                // Status HTTP a retornar (401)
  errorCode: string;                     // Código de error ('TOKEN_EXPIRED')
}

// PASO 3: Crear un símbolo único para guardar metadata en las clases
// SYMBOL: Identificador único que evita colisiones con otras propiedades
const ERROR_HANDLER_METADATA = Symbol('error-handler-metadata');

/**
 * ========================================
 * 🎯 DECORATOR PATTERN EXPLICADO:
 * ========================================
 * 
 * Un DECORATOR es una función que modifica el comportamiento de clases/métodos.
 * Se ejecuta en TIEMPO DE COMPILACIÓN, no en runtime.
 * 
 * VENTAJAS:
 * ✅ Código más limpio y declarativo
 * ✅ Separación de responsabilidades  
 * ✅ Reutilizable en múltiples clases
 * ✅ Configuración centralizada
 * 
 * CÓMO FUNCIONA:
 * 1. Node.js carga la clase decorada
 * 2. Ejecuta el decorator automáticamente
 * 3. El decorator guarda información y registra la clase
 * 4. La clase queda lista para usar sin configuración manual
 * 
 * Ejemplo: @ErrorHandler({ exceptionType: TokenExpiredException, httpStatus: 401, errorCode: 'TOKEN_EXPIRED' })
 * ========================================
 */
export function ErrorHandler(metadata: ErrorHandlerMetadata) {
  // FACTORY FUNCTION: Retorna una función que recibe la clase decorada
  return function (target: any) {
    // PASO A: Guardar la metadata en la clase usando Reflect API
    // REFLECT: API de JavaScript para manipular metadata de objetos
    Reflect.defineMetadata(ERROR_HANDLER_METADATA, metadata, target);
    
    // PASO B: Auto-registrar la clase en el Registry (sin que el desarrollador tenga que hacerlo manual)
    ErrorHandlerRegistry.register(target);
  };
}

/**
 * ========================================
 * 🗂️ REGISTRY PATTERN EXPLICADO:
 * ========================================
 * 
 * Un REGISTRY es un almacén centralizado que guarda y busca objetos por clave.
 * Es como un directorio telefónico: buscas por nombre y encuentras el número.
 * 
 * VENTAJAS:
 * ✅ Centraliza el registro de objetos
 * ✅ Búsqueda rápida O(1) usando Map
 * ✅ Evita if/else complejos
 * ✅ Fácil de extender con nuevos handlers
 * 
 * EN NUESTRO CASO:
 * Busca: "TokenExpiredException" → Encuentra: TokenExpiredHandler
 * Busca: "InvalidTokenException" → Encuentra: InvalidTokenHandler
 * ========================================
 */
export class ErrorHandlerRegistry {
  // PASO 4: Map estático que guarda: "NombreExcepción" -> HandlerInstance
  // MAP: Estructura de datos clave-valor con búsqueda O(1)
  // STATIC: Compartido entre todas las instancias de la clase
  // Ejemplo: "TokenExpiredException" -> instancia de TokenExpiredHandler
  private static handlers: Map<string, ErrorHandler> = new Map();

  // PASO 5: Método para registrar un nuevo handler (llamado automáticamente por el decorator)
  static register(handlerClass: any) {
    // Recuperar la metadata que el decorator guardó en la clase
    const metadata: ErrorHandlerMetadata = Reflect.getMetadata(ERROR_HANDLER_METADATA, handlerClass);
    
    // Crear una instancia del handler
    const handler = new handlerClass();
    
    // Guardar en el Map: "TokenExpiredException" -> handler instance
    this.handlers.set(metadata.exceptionType.name, handler);
  }

  // PASO 6: Buscar el handler apropiado para una excepción específica
  static getHandler(exception: DomainException): ErrorHandler | null {
    // Buscar en el Map usando el nombre de la clase de excepción
    // Ejemplo: si exception es TokenExpiredException, busca "TokenExpiredException" en el Map
    return this.handlers.get(exception.constructor.name) || null;
  }

  // PASO 7: Método principal - dado una excepción, retorna el status y error code
  static getErrorMapping(exception: DomainException): { status: HttpStatus; errorCode: string } {
    // Buscar el handler apropiado
    const handler = this.getHandler(exception);
    
    if (handler) {
      // Si encontró handler, pedirle el status y error code
      return {
        status: handler.getHttpStatus(),     // 401
        errorCode: handler.getErrorCode()    // 'TOKEN_EXPIRED'
      };
    }
    
    // Si no hay handler registrado, retornar error genérico
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,  // 500
      errorCode: 'UNKNOWN_ERROR'
    };
  }
}