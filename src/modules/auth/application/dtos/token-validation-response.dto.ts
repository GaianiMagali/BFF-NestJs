
/**
 * 📦 DTOs (Data Transfer Objects) - Objetos de transferencia de datos
 * 
 * ¿Qué son los DTOs?
 * - Objetos SIMPLES diseñados para transferir datos entre capas
 * - NO contienen lógica de negocio - solo datos
 * - Son inmutables (readonly properties)
 * - Definen la ESTRUCTURA de las respuestas de la API
 * - Actúan como CONTRATOS entre el backend y frontend
 * 
 * ¿Por qué usar DTOs en lugar de las Entities directamente?
 * - DESACOPLAMIENTO: el frontend no depende de la estructura interna del dominio
 * - SEGURIDAD: podés filtrar qué campos exponer al exterior
 * - ESTABILIDAD: cambios internos no rompen la API
 * - VERSIONADO: podés mantener múltiples versiones de DTOs
 * - TRANSFORMACIÓN: podés adaptar datos del dominio al formato que necesita el cliente
 * 
 * PATRÓN APLICADO: Data Transfer Object Pattern
 * - Reduce el número de llamadas entre capas (empaqueta múltiples datos)
 * - Simplifica la interface entre sistemas distribuidos
 * - Permite optimizaciones específicas para el transporte de datos
 */

/**
 * 📤 DTO DE RESPUESTA - Validación exitosa de token
 * 
 * Este DTO representa la respuesta completa cuando la validación de token
 * es exitosa. Contiene todo lo que el frontend necesita:
 * - Mensaje de confirmación
 * - Información del usuario
 * - Token renovado para futuras requests
 * 
 * ESTRUCTURA JSON QUE GENERA:
 * ```json
 * {
 *   "message": "Validación de token exitosa",
 *   "user": {
 *     "sub": "12345",
 *     "username": "juan.perez",
 *     "validated": true
 *   },
 *   "validatedToken": "renewed_eyJhbGciOiJIUzI1NiIs...1234567890"
 * }
 * ```
 */
export class TokenValidationResponseDto {
  readonly message: string;           // 💬 Mensaje descriptivo del resultado
  readonly user: UserInfoDto;         // 👤 Información del usuario validado
  readonly validatedToken: string;    // 🔑 Token renovado para usar en próximas requests

  /**
   * Constructor que inicializa todos los campos requeridos
   * 
   * @param message - Mensaje descriptivo (ej: "Validación exitosa")
   * @param user - DTO con información del usuario
   * @param validatedToken - Token JWT renovado
   */
  constructor(message: string, user: UserInfoDto, validatedToken: string) {
    this.message = message;
    this.user = user;
    this.validatedToken = validatedToken;
  }

  /**
   * 🏭 FACTORY METHOD - Crear respuesta exitosa (patrón de conveniencia)
   * 
   * Método estático que facilita la creación de respuestas exitosas estándar
   */
  static success(user: UserInfoDto, validatedToken: string): TokenValidationResponseDto {
    return new TokenValidationResponseDto(
      'Validación de token exitosa',
      user,
      validatedToken
    );
  }
}

/**
 * 👤 DTO DE USUARIO - Información básica del usuario
 * 
 * Contiene solo la información del usuario que es segura exponer
 * al frontend después de una validación exitosa.
 * 
 * CAMPOS INCLUIDOS:
 * - sub: ID único del usuario (Subject del JWT)
 * - username: Nombre de usuario legible
 * - validated: Flag indicando que pasó todas las validaciones
 * 
 * CAMPOS EXCLUIDOS (por seguridad):
 * - Passwords o hashes
 * - Información sensible como email completo
 * - Roles o permisos específicos (podrían ir en otro DTO)
 * - Timestamps internos o metadata técnica
 * 
 * ESTRUCTURA JSON:
 * ```json
 * {
 *   "sub": "user123",
 *   "username": "juan.perez", 
 *   "validated": true
 * }
 * ```
 */
export class UserInfoDto {
  readonly sub: string;        // 🆔 ID único del usuario (Subject del JWT)
  readonly username: string;   // 👤 Nombre de usuario legible
  readonly validated: boolean; // ✅ Flag de validación exitosa

  /**
   * Constructor con validated como opcional (por defecto true)
   * 
   * @param sub - ID único del usuario
   * @param username - Nombre de usuario
   * @param validated - Si el usuario fue validado exitosamente (default: true)
   */
  constructor(sub: string, username: string, validated: boolean = true) {
    this.sub = sub;
    this.username = username;
    this.validated = validated;
  }

  /**
   * 🏭 FACTORY METHOD - Crear desde entity Token
   * 
   * Convierte una Entity del dominio a DTO de forma controlada
   */
  static fromToken(token: any): UserInfoDto {
    return new UserInfoDto(
      token.sub,
      token.username,
      true
    );
  }

  /**
   * 🔍 MÉTODO DE UTILIDAD - Representación string para logs
   */
  toString(): string {
    return `User(sub: ${this.sub}, username: ${this.username})`;
  }
}