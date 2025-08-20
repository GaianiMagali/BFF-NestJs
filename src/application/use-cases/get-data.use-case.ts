import { Injectable } from '@nestjs/common';
import { DataApiAdapter } from '../../infrastructure/adapters/data-api.adapter';

/**
 * CASO DE USO: Obtener Datos
 * 
 * Capa de Aplicación - Obtiene datos de la API externa:
 * 1. Usa el token validado para consultar la API de datos
 * 2. Devuelve los datos obtenidos
 */
@Injectable()
export class GetDataUseCase {
  constructor(
    private readonly dataApiAdapter: DataApiAdapter
  ) {}

  /**
   * Obtiene datos de la API externa usando token validado
   * @param validatedToken - Token validado por la API de validación
   * @returns Datos de la API externa
   */
  async execute(validatedToken: string): Promise<any> {
    return await this.dataApiAdapter.getData(validatedToken);
  }
}