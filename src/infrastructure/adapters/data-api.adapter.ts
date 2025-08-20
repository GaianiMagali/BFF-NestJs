import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * ADAPTADOR DE API DE DATOS - Capa de Infraestructura
 * 
 * Se conecta con API externa para obtener datos después de
 * validar el token. La URL base se configura via variables de entorno.
 */
@Injectable()
export class DataApiAdapter {
  private readonly baseUrl = process.env.EXTERNAL_API_BASE_URL!;

  constructor(private readonly httpService: HttpService) {}

  /**
   * Obtiene datos desde la API externa usando el token validado
   * @param validatedToken - Token validado por la API de validación
   * @returns Lista de pokémon desde la API externa
   */
  async getData(validatedToken: string): Promise<any> {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      // Enviar solo el token validado por expiración en el body del POST
      const payload = {
        token: validatedToken
      };

      // Endpoint simple que trae lista de pokémon (primeros 20)
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/pokemon?limit=20`, payload, { headers })
      );

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch pokemon data: ${error?.message || 'Unknown error'}`);
    }
  }
}