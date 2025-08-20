/**
 * ENTIDAD DEL DOMINIO: Token
 * 
 * Representa un token JWT con su PAYLOAD completo decodificado.
 * Esta entidad contiene toda la información del usuario extraída del JWT.
 */
export class Token {
  constructor(
    private readonly payload: any  // Payload completo del JWT decodificado
  ) {}

  // Getters para acceder a propiedades estándar del JWT
  get getSub(): string {
    return this.payload.sub || this.payload.userId || 'unknown';
  }

  get getUsername(): string {
    return this.payload.username || this.payload.name || this.payload.preferred_username || 'unknown';
  }

  get getExp(): number {
    return this.payload.exp;
  }

  get getIat(): number {
    return this.payload.iat;
  }

  // Getter para obtener el payload completo
  get getPayload(): any {
    return { ...this.payload };
  }
 
  /**
   * Verifica si el token ha expirado
   * @returns true si el token está vencido, false en caso contrario
   */
  isExpired(): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= this.getExp;
  }
}