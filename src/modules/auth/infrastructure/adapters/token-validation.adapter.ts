import { Injectable, Inject } from '@nestjs/common';
import { IExternalTokenValidationPort } from '../../domain/ports/external-token-validation.port';
import { UpstreamHttpException } from '../../domain/exceptions/token.exception';
import type { ILoggerPort } from '../../../../shared/domain/ports/logger.port';

@Injectable()
export class TokenValidationAdapter implements IExternalTokenValidationPort {
  constructor(
    @Inject('ILoggerPort')
    private readonly logger: ILoggerPort
  ) {}

  async validateAndRenewToken(originalToken: string): Promise<string> {
    // Simulación de diferentes respuestas de API externa
    // En la implementación real, esto será una llamada HTTP
    
    // Simular un 10% de fallos para testing
    if (Math.random() < 0.1) {
      // Ejemplo de error 401 de la API externa
      throw new UpstreamHttpException(401, 'Token inválido en sistema externo');
    }
    
    // TODO: Reemplazar con llamada HTTP real
    // const response = await this.httpClient.post('/validate-token', { token: originalToken });
    // if (!response.ok) {
    //   throw new UpstreamHttpException(response.status, response.data.message || 'Error en API externa');
    // }
    // return response.data.renewedToken;
    
    const mockRenewedToken = `renewed_${originalToken.substring(0, 20)}...${Date.now()}`;
    
    this.logger.log('External token validation successful, renewed token obtained', 'TokenValidationAdapter');
    return mockRenewedToken;
  }
}