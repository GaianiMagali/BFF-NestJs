import { Injectable, Inject } from '@nestjs/common';
import type { ITokenRepository } from '../../domain/repositories/token.repository';
import { Token } from '../../domain/entities/token.entity';
import { TokenValidationAdapter } from '../../infrastructure/adapters/token-validation.adapter';
import { 
  TokenExpiredException, 
  InvalidTokenException, 
  TokenNotFoundException 
} from '../../domain/exceptions/token.exception';

/**
 * CASO DE USO: Validar Token
 * 
 * Capa de Aplicación - Orquesta la validación del token:
 * 1. Decodifica JWT y verifica expiración local
 * 2. Envía token a API externa para validación
 * 3. Devuelve token validado para uso posterior
 */
@Injectable()
export class ValidateTokenUseCase {
  constructor(
    @Inject('ITokenRepository')
    private readonly tokenRepository: ITokenRepository,
    private readonly tokenValidationAdapter: TokenValidationAdapter,
  ) {}

  /**
   * Ejecuta la validación del token
   * @param tokenValue - Token JWT recibido del header Authorization
   * @returns Token validado por la API externa para uso posterior
   */
  async execute(tokenValue: string | undefined): Promise<string> {
    // 1. Verificar que se haya enviado un token
    if (!tokenValue) {
      throw new TokenNotFoundException();
    }

    // 2. Decodificar el token (sin verificar firma)
    const token = await this.tokenRepository.validateToken(tokenValue);
    
    // 3. Verificar que el token sea válido y tenga la estructura correcta
    if (!token) {
      throw new InvalidTokenException();
    }

    // 4. Verificar que no esté vencido
    if (token.isExpired()) {
      throw new TokenExpiredException();
    }

    // 5. Validar con API externa y obtener token válido
    try {
      const validatedToken = await this.tokenValidationAdapter.validateAndRenewToken(tokenValue);
      return validatedToken;
    } catch (error: any) {
      console.warn('Token validation with external API failed:', error?.message || 'Unknown error');
      throw new InvalidTokenException('Token validation with external API failed');
    }
  }
}