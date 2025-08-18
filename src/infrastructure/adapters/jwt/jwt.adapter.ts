import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ITokenRepository } from '../../../domain/repositories/token.repository';
import { Token } from '../../../domain/entities/token.entity';

/**
 * ADAPTADOR JWT - Capa de Infraestructura
 * 
 * Implementa la interfaz del repositorio de tokens usando jsonwebtoken.
 * Se encarga solo de decodificar el JWT SIN validar la firma.
 * La validación de firma se delega a la API externa.
 */
@Injectable()
export class JwtAdapter implements ITokenRepository {
  
  /**
   * Valida y decodifica un token JWT (sin verificar firma)
   * @param tokenValue - Token JWT con o sin prefijo 'Bearer '
   * @returns Token decodificado o null si es inválido
   */
  async validateToken(tokenValue: string): Promise<Token | null> {
    try {
      // Limpiar el token removiendo 'Bearer ' si está presente
      const cleanToken = this.extractBearerToken(tokenValue);
      
      // Decodificar sin verificar firma (jwt.decode vs jwt.verify)
      const decoded = jwt.decode(cleanToken) as any;
      
      // Verificar que tenga la estructura mínima requerida
      if (!decoded || !decoded.exp) {
        return null;
      }

      // Crear la entidad Token con el payload completo decodificado
      return new Token(decoded);
    } catch (error) {
      return null; // Si hay error en decodificación, token inválido
    }
  }

  /**
   * Método alternativo para decodificar tokens (mismo comportamiento)
   */
  async decodeToken(tokenValue: string): Promise<Token | null> {
    try {
      const cleanToken = this.extractBearerToken(tokenValue);
      const decoded = jwt.decode(cleanToken) as any;
      
      if (!decoded || !decoded.exp) {
        return null;
      }

      return new Token(decoded);
    } catch (error) {
      return null;
    }
  }

  /**
   * Extrae el token limpio removiendo el prefijo 'Bearer ' si existe
   * @param tokenValue - Token con o sin prefijo
   * @returns Token limpio
   */
  private extractBearerToken(tokenValue: string): string {
    if (tokenValue.startsWith('Bearer ')) {
      return tokenValue.substring(7);
    }
    return tokenValue;
  }
}