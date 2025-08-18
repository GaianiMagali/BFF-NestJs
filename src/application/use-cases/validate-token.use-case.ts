import { Injectable, Inject } from '@nestjs/common';
import type { ITokenRepository } from '../../domain/repositories/token.repository';
import { Token } from '../../domain/entities/token.entity';
import { UserApiAdapter } from '../../infrastructure/adapters/external-api/user-api.adapter';
import { TokenValidationAdapter } from '../../infrastructure/adapters/external-api/token-validation.adapter';
import { 
  TokenExpiredException, 
  InvalidTokenException, 
  TokenNotFoundException 
} from '../../domain/exceptions/token.exception';

/**
 * CASO DE USO: Validar Token
 * 
 * Capa de Aplicación - Orquesta la validación completa de tokens:
 * 1. Decodifica JWT y verifica expiración
 * 2. Valida con API externa y obtiene token renovado
 * 3. Usa token renovado para obtener info del usuario
 */
@Injectable()
export class ValidateTokenUseCase {
  constructor(
    @Inject('ITokenRepository')
    private readonly tokenRepository: ITokenRepository,
    private readonly tokenValidationAdapter: TokenValidationAdapter,
    private readonly userApiAdapter: UserApiAdapter,
  ) {}

  /**
   * Ejecuta la validación completa del token
   * @param tokenValue - Token JWT recibido del header Authorization
   * @returns Resultado de la validación con datos enriquecidos del usuario
   */
  async execute(tokenValue: string | undefined): Promise<{ 
    isValid: boolean; 
    token?: Token; 
    userInfo?: any;
    message: string 
  }> {
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

    // 5. Validar con API externa y obtener token renovado
    let renewedToken: string;
    try {
      renewedToken = await this.tokenValidationAdapter.validateAndRenewToken(tokenValue);
    } catch (error: any) {
      console.warn('Token validation with external API failed:', error?.message || 'Unknown error');
      throw new InvalidTokenException('Token validation with external API failed');
    }

    // 6. Usar token renovado para obtener información del usuario
    try {
      const userInfo = await this.userApiAdapter.getUserInfo(
        token.getSub,
        renewedToken  // ← Usar token renovado en lugar del original
      );

      return {
        isValid: true,
        token,
        userInfo,
        message: 'Token validated, renewed, and user info retrieved'
      };
    } catch (error: any) {
      // Si falla la API de usuario, retornar solo la validación del token
      console.warn('Failed to fetch user info from external API:', error?.message || 'Unknown error');
      
      return {
        isValid: true,
        token,
        message: 'Token validated and renewed, but user info unavailable'
      };
    }
  }
}