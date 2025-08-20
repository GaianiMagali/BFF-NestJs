import { JwtPayload } from '../value-objects/jwt-payload.value-object';

/**
 * 📊 ENTITY - Token de autenticación
 * 
 * ¿Qué es una Entity en DDD?
 * - Objeto con IDENTIDAD PROPIA que persiste en el tiempo
 * - Representa conceptos principales del negocio
 * - Contiene datos Y comportamientos del dominio
 * - Se identifica por su ID, no por sus atributos
 * 
 * ¿Por qué Token es una Entity?
 * - Representa un concepto central: "credencial de acceso"
 * - Tiene identidad única (aunque aquí usamos el payload como ID)
 * - Contiene reglas de negocio (ej: validar expiración)
 * - Su estado puede cambiar pero sigue siendo el mismo token
 * 
 * PATRÓN APLICADO: Facade/Wrapper
 * - Encapsula el JwtPayload y expone solo lo necesario
 * - Abstrae la complejidad del Value Object subyacente
 */
export class Token {
  constructor(
    private readonly jwtPayload: JwtPayload  // 💎 Composición con Value Object
  ) {}

  /**
   * 🔍 GETTERS - Interfaz pública de la Entity
   * Exponen los datos del Value Object de forma controlada.
   * Esto mantiene el encapsulamiento y permite cambios internos
   * sin afectar el código cliente.
   */
  get sub(): string {
    return this.jwtPayload.sub;
  }

  get username(): string {
    return this.jwtPayload.username;
  }

  get exp(): number {
    return this.jwtPayload.exp;
  }

  get iss(): string {
    return this.jwtPayload.iss;
  }

  /**
   * 🎯 GETTER DE CONVENIENCIA 
   * Expone el payload completo para casos específicos
   * donde se necesita acceso al Value Object (ej: en use cases)
   */
  get payload(): JwtPayload {
    return this.jwtPayload;
  }

  /**
   * 🔧 MÉTODO DE DOMINIO
   * Las entities contienen la lógica de negocio relacionada a sí mismas.
   * Este método delega en el Value Object, siguiendo el principio de 
   * "Tell, Don't Ask" - le dice al payload que se valide, no pregunta por datos.
   * 
   * PATRÓN: Delegation
   */
  isExpired(): boolean {
    return this.jwtPayload.isExpired();
  }
}