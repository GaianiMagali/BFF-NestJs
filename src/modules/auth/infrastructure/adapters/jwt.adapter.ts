import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ITokenRepository } from '../../domain/repositories/token.repository';
import { Token } from '../../domain/entities/token.entity';
import { JwtPayload } from '../../domain/value-objects/jwt-payload.value-object';
import { InvalidTokenException } from '../../domain/exceptions/token.exception';

/**
 * 🔌 ADAPTER - Implementación JWT para validación de tokens
 * 
 * ¿Qué es un Adapter en Arquitectura Hexagonal?
 * - Implementación CONCRETA de un puerto (interface)
 * - Traduce entre el dominio y tecnologías externas
 * - Permite cambiar tecnologías sin afectar el dominio
 * - Es la capa más externa - maneja detalles técnicos
 * 
 * ¿Por qué JwtAdapter es un Adapter?
 * - Implementa el puerto ITokenRepository 
 * - Usa la librería 'jsonwebtoken' (tecnología específica)
 * - Traduce de JWT crudo a objetos del dominio (Token)
 * - Se puede reemplazar por OAuthAdapter, Auth0Adapter, etc.
 * 
 * PATRONES APLICADOS:
 * - Adapter Pattern: convierte interface incompatible (JWT) a compatible (dominio)
 * - Dependency Inversion: el dominio define qué necesita, no cómo lo obtiene
 * - Template Method: validateToken define el algoritmo, métodos privados los pasos
 */
@Injectable()
export class JwtAdapter implements ITokenRepository {
  
  /**
   * 🎯 MÉTODO PRINCIPAL - Validar y parsear token JWT
   * 
   * ALGORITMO (Template Method Pattern):
   * 1. Limpiar token (quitar "Bearer ")
   * 2. Decodificar JWT (SIN verificar firma - eso es responsabilidad del BFF)
   * 3. Validar estructura del payload
   * 4. Crear objetos del dominio
   * 5. Manejar errores de forma consistente
   * 
   * ¿Por qué jwt.decode() y no jwt.verify()?
   * - El BFF solo valida estructura y expiración LOCAL
   * - La verificación de firma la hace la API externa
   * - Esto permite que el BFF funcione como proxy/gateway
   * 
   * @param tokenValue - Token crudo del header Authorization
   * @returns Token del dominio o null si es inválido
   * @throws InvalidTokenException si el token no es válido
   */
  async validateToken(tokenValue: string): Promise<Token | null> {
    try {
      // 🧹 PASO 1: Limpiar token
      const cleanToken = this.extractBearerToken(tokenValue);
      
      // 🔍 PASO 2: Decodificar JWT (sin verificar firma)
      const decoded = jwt.decode(cleanToken) as any;
      
      if (!decoded) {
        throw new InvalidTokenException();
      }

      // ✅ PASO 3: Validar estructura ANTES de crear objetos del dominio
      this.validatePayloadStructure(decoded);

      // 🏭 PASO 4: Crear objetos del dominio usando Factory Methods
      const payload = JwtPayload.fromDecodedToken(decoded);
      return new Token(payload);
      
    } catch (error) {
      // 🔄 PASO 5: Manejo consistente de errores
      if (error instanceof InvalidTokenException) {
        throw error; // Re-lanza excepciones del dominio
      }
      // Cualquier error técnico (JSON malformado, etc.) se convierte a dominio
      throw new InvalidTokenException();
    }
  }

  /**
   * 🔒 MÉTODO PRIVADO - Validar estructura del payload
   * 
   * PATRÓN: Guard Clause / Fail Fast
   * - Valida cada condición y falla inmediatamente
   * - Evita nesting excesivo con if/else anidados
   * - Hace el código más legible y mantenible
   * 
   * RESPONSABILIDADES:
   * - Verificar que el payload sea un objeto
   * - Verificar presencia de campos requeridos
   * - Verificar tipos de datos correctos
   * 
   * ¿Por qué validar tipos aquí y no en el Value Object?
   * - El Value Object asume datos válidos (contract by design)
   * - El Adapter es responsable de la conversión desde datos externos
   * - Separación clara: Adapter valida formato, Domain valida negocio
   * 
   * @param payload - Objeto decodificado del JWT
   * @throws InvalidTokenException si la estructura es inválida
   */
  private validatePayloadStructure(payload: any): void {
    // 🚨 Guard: Verificar que sea un objeto
    if (!payload || typeof payload !== 'object') {
      throw new InvalidTokenException();
    }

    // 🚨 Guard: Verificar presencia de campos requeridos
    const requiredFields = ['sub', 'username', 'exp', 'iss'];
    
    for (const field of requiredFields) {
      if (!(field in payload)) {
        throw new InvalidTokenException();
      }
    }

    // 🚨 Guard: Verificar tipos de datos
    if (typeof payload.sub !== 'string' || 
        typeof payload.username !== 'string' || 
        typeof payload.exp !== 'number' || 
        typeof payload.iss !== 'string') {
      throw new InvalidTokenException();
    }
  }

  /**
   * 🧹 MÉTODO PRIVADO - Extraer token del formato "Bearer"
   * 
   * PATRÓN: Utility Method
   * - Maneja un detalle técnico específico del protocolo HTTP
   * - Aísla la lógica de parsing del header Authorization
   * - Permite cambios futuros sin afectar el método principal
   * 
   * CASOS MANEJADOS:
   * - "Bearer eyJhbGciOiJ..." → "eyJhbGciOiJ..."
   * - "eyJhbGciOiJ..." → "eyJhbGciOiJ..." (sin cambios)
   * 
   * @param tokenValue - Valor del header Authorization
   * @returns Token limpio sin prefijo "Bearer "
   */
  private extractBearerToken(tokenValue: string): string {
    if (tokenValue.startsWith('Bearer ')) {
      return tokenValue.substring(7); // Remueve "Bearer " (7 caracteres)
    }
    return tokenValue;
  }
}