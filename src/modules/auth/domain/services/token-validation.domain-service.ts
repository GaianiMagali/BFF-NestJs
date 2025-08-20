import { Injectable, Inject } from '@nestjs/common';
import { Token } from '../entities/token.entity';
import { TokenExpiredException, InvalidTokenClaimsException } from '../exceptions/token.exception';
import type { ILoggerPort } from '../../../../shared/domain/ports/logger.port';

@Injectable()
export class TokenValidationDomainService {
  
  constructor(
    @Inject('ILoggerPort')
    private readonly logger: ILoggerPort
  ) {}
  
  validateTokenBusinessRules(token: Token): boolean {
    if (token.isExpired()) {
      throw new TokenExpiredException();
    }

    if (!this.hasRequiredClaims(token)) {
      throw new InvalidTokenClaimsException();
    }
    
    this.logger.log('Token validation successful - business rules passed', 'TokenValidationDomainService');
    return true;
  }

  private hasRequiredClaims(token: Token): boolean {
    return token.sub != null && 
           token.sub.trim() !== '' &&
           token.username != null && 
           token.username.trim() !== '' &&
           token.exp > 0 && 
           token.iss != null &&
           token.iss.trim() !== '';
  }
}