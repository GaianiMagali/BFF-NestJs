import { Token } from '../entities/token.entity';

/**
 * 🔌 PUERTO (PORT) - Contrato para validación de tokens
 * 
 * ¿Qué es un Puerto en Arquitectura Hexagonal?
 * - INTERFACE que define QUÉ necesita el dominio del mundo exterior
 * - NO define CÓMO se implementa - solo el contrato
 * - Permite múltiples implementaciones (JWT, OAuth, Auth0, etc.)
 * - Invierte la dependencia: el dominio define qué necesita
 * 
 * ¿Por qué ITokenValidationPort es un Puerto?
 * - El dominio NECESITA validar tokens pero NO sabe CÓMO
 * - Define el contrato: "dame un string, te devuelvo un Token válido o null"
 * - Permite cambiar la tecnología (JWT → OAuth) sin tocar el dominio
 * - El dominio DEPENDE de la interface, NO de la implementación
 * 
 * PATRÓN APLICADO: Dependency Inversion Principle (DIP)
 * - Módulos de alto nivel (dominio) no dependen de bajo nivel (adapters)
 * - Ambos dependen de abstracciones (interfaces/puertos)
 * - Las abstracciones no dependen de detalles, los detalles dependen de abstracciones
 * 
 * EJEMPLO DE USO:
 * ```typescript
 * constructor(
 *   @Inject('ITokenRepository')
 *   private tokenRepository: ITokenRepository  // ← Interface, no implementación
 * ) {}
 * 
 * providers: [
 *   { provide: 'ITokenRepository', useClass: JwtAdapter }  // ← Implementación específica
 * ]
 * ```
 */
export interface ITokenRepository {
  /**
   * Valida un token y retorna la entidad del dominio correspondiente
   * 
   * RESPONSABILIDADES del implementador:
   * - Parsear y validar el formato del token
   * - Extraer información del payload
   * - Crear objetos del dominio (Token, JwtPayload)
   * - Manejar errores de formato/estructura
   * - NO validar reglas de negocio (eso es del Domain Service)
   * 
   * @param tokenValue - Token crudo (puede incluir "Bearer " o no)
   * @returns Token del dominio si es válido, null si es inválido
   * @throws InvalidTokenException si el token tiene formato incorrecto
   */
  validateToken(tokenValue: string): Promise<Token | null>;
}