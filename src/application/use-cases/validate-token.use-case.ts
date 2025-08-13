import { Injectable } from '@nestjs/common';
import { ITokenRepository } from '../../domain/repositories/token.repository';
import { Token } from '../../domain/entities/token.entity';
import { 
  TokenExpiredException, 
  InvalidTokenException, 
  TokenNotFoundException 
} from '../../domain/exceptions/token.exception';

@Injectable()
export class ValidateTokenUseCase {
  constructor(private readonly tokenRepository: ITokenRepository) {}

  async execute(tokenValue: string | undefined): Promise<{ 
    isValid: boolean; 
    token?: Token; 
    message: string 
  }> {
    if (!tokenValue) {
      throw new TokenNotFoundException();
    }

    const token = await this.tokenRepository.validateToken(tokenValue);
    
    if (!token) {
      throw new InvalidTokenException();
    }

    if (token.isExpired()) {
      throw new TokenExpiredException();
    }

    return {
      isValid: true,
      token,
      message: 'Token is valid'
    };
  }
}