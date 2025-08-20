/**
 * 💎 VALUE OBJECT - Payload del JWT
 * 
 * ¿Qué es un Value Object en DDD?
 * - Objeto INMUTABLE que se define por su VALOR, no por identidad
 * - No tiene ID - dos Value Objects son iguales si tienen los mismos datos
 * - Encapsula datos relacionados y comportamientos sobre esos datos
 * - Se puede reemplazar completamente (no se modifica)
 * 
 * ¿Por qué JwtPayload es un Value Object?
 * - Es inmutable (readonly properties)
 * - Se identifica por sus valores, no por identidad propia
 * - Encapsula la lógica de validación del payload JWT
 * - Puede ser reemplazado sin afectar al sistema
 * 
 * PATRONES APLICADOS:
 * - Factory Method: fromDecodedToken()
 * - Encapsulation: métodos públicos vs. lógica interna
 * - Immutability: readonly properties
 */
export class JwtPayload {
  constructor(
    public readonly sub: string,      // 🆔 Subject (ID del usuario)
    public readonly username: string, // 👤 Nombre del usuario  
    public readonly exp: number,      // ⏰ Timestamp de expiración
    public readonly iss: string       // 🏢 Issuer (quien emitió el token)
  ) {}

  /**
   * 🏭 FACTORY METHOD
   * 
   * Patrón: Factory Method
   * ¿Por qué usar Factory Method?
   * - Encapsula la lógica de creación
   * - Permite validaciones antes de construir
   * - Hace el código más expresivo: fromDecodedToken() es más claro que new JwtPayload()
   * - Permite diferentes formas de construcción
   * 
   * @param payload - Objeto crudo decodificado del JWT
   * @returns Nueva instancia de JwtPayload
   */
  static fromDecodedToken(payload: any): JwtPayload {
    return new JwtPayload(
      payload.sub,
      payload.username,
      payload.exp,
      payload.iss
    );
  }

  /**
   * 🔧 MÉTODO DE DOMINIO - Validación de expiración
   * 
   * Este método contiene LÓGICA DE NEGOCIO específica del dominio.
   * 
   * Regla de negocio implementada:
   * "Un token está expirado si el tiempo actual >= tiempo de expiración"
   * 
   * ¿Por qué está aquí y no en una función externa?
   * - El Value Object encapsula tanto datos como comportamientos relacionados
   * - Mantiene cohesión: los datos (exp) están junto a su lógica (isExpired)
   * - Facilita testing: probás el objeto completo, no funciones sueltas
   * 
   * @returns true si el token está expirado, false en caso contrario
   */
  isExpired(): boolean {
    const currentTime = Math.floor(Date.now() / 1000); // Unix timestamp en segundos
    return currentTime >= this.exp;
  }

  /**
   * 📋 MÉTODO DE UTILIDAD - Representación para debugging
   * 
   * Útil para logging y debugging. Como es inmutable, podemos
   * exponer toda la información sin riesgo de modificación.
   */
  toString(): string {
    return `JwtPayload(sub: ${this.sub}, username: ${this.username}, exp: ${this.exp}, iss: ${this.iss})`;
  }
}