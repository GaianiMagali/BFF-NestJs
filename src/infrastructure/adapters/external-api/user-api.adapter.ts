import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * ADAPTADOR DE API EXTERNA - Capa de Infraestructura
 * 
 * Se conecta con API externa para obtener información adicional
 * del usuario. La URL base se configura via variables de entorno.
 */
@Injectable()
export class UserApiAdapter {
  private readonly baseUrl = process.env.EXTERNAL_API_BASE_URL!;

  constructor(private readonly httpService: HttpService) {}

  /**
   * Obtiene información del usuario desde la API externa
   * @param userId - ID del usuario extraído del token
   * @param token - Token JWT para autenticación (simulado)
   * @returns Información adicional del usuario
   */
  async getUserInfo(userId: string, token: string): Promise<any> {
    try {
      // Simular envío del token en headers como haría una API real
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // JSONPlaceholder no valida tokens, pero simula el patrón
      // Usar ID del usuario para obtener datos (1-10 son usuarios válidos)
      const userIdNumber = this.extractUserIdNumber(userId);
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/users/${userIdNumber}`, { headers })
      );

      return {
        id: response.data.id,
        name: response.data.name,
        username: response.data.username,
        email: response.data.email,
        phone: response.data.phone,
        website: response.data.website,
        company: response.data.company,
        address: response.data.address,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch user info: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Extrae un número de usuario válido para JSONPlaceholder (1-10)
   * @param userId - ID del usuario del token
   * @returns Número entre 1 y 10
   */
  private extractUserIdNumber(userId: string): number {
    // Si el userId es numérico y está en rango, usarlo
    const numericId = parseInt(userId);
    if (!isNaN(numericId) && numericId >= 1 && numericId <= 10) {
      return numericId;
    }
    
    // Si no, generar un número basado en el hash del userId
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 10) + 1; // Resultado entre 1 y 10
  }
}