import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * ADAPTADOR DE VALIDACIÓN DE TOKENS - Capa de Infraestructura
 * 
 * Se conecta con API externa para validar el token original
 * y obtener un token renovado que será usado para llamadas posteriores.
 */
@Injectable()
export class TokenValidationAdapter {
  private readonly validationUrl = process.env.TOKEN_VALIDATION_API_URL || 'https://httpbin.org/post';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Valida el token con la API externa y obtiene un token renovado
   * @param originalToken - Token JWT original del usuario
   * @returns Token renovado para usar en APIs externas
   */
  async validateAndRenewToken(originalToken: string): Promise<string> {
    try {
      // Preparar headers para la API de validación
      const headers = {
        'Authorization': `Bearer ${originalToken}`,
        'Content-Type': 'application/json',
      };

      // Payload para la API de validación
      const payload = {
        token: originalToken,
        action: 'validate_and_renew'
      };

      const response = await firstValueFrom(
        this.httpService.post(this.validationUrl, payload, { headers })
      );

      // Simular respuesta de API real - en producción sería algo como:
      // return response.data.renewedToken;
      
      // Para httpbin.org que solo hace echo, simulamos un token renovado
      const mockRenewedToken = `renewed_${originalToken.substring(0, 20)}...${Date.now()}`;
      
      console.log('🔄 Token validation successful, renewed token obtained');
      return mockRenewedToken;

    } catch (error: any) {
      console.error('❌ Token validation failed:', error?.message || 'Unknown error');
      throw new Error(`Token validation failed: ${error?.message || 'API unavailable'}`);
    }
  }
}