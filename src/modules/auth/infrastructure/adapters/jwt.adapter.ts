import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ITokenValidationPort } from '../../domain/ports/token-validation.port';
import { Token } from '../../domain/entities/token.entity';
import { JwtPayload } from '../../domain/value-objects/jwt-payload.value-object';
import { InvalidTokenException } from '../../domain/exceptions/token.exception';

@Injectable()
export class JwtAdapter implements ITokenValidationPort {
  
  async validateToken(tokenValue: string): Promise<Token | null> {
    try {
      const cleanToken = this.extractBearerToken(tokenValue);
      const decoded = jwt.decode(cleanToken) as any;
      
      if (!decoded) {
        throw new InvalidTokenException();
      }

      this.validatePayloadStructure(decoded);

      const payload = JwtPayload.fromDecodedToken(decoded);
      return new Token(payload);
    } catch (error) {
      if (error instanceof InvalidTokenException) {
        throw error;
      }
      throw new InvalidTokenException();
    }
  }

  private validatePayloadStructure(payload: any): void {
    if (!payload || typeof payload !== 'object') {
      throw new InvalidTokenException();
    }

    const requiredFields = ['sub', 'username', 'exp', 'iss'];
    
    for (const field of requiredFields) {
      if (!(field in payload)) {
        throw new InvalidTokenException();
      }
    }

    if (typeof payload.sub !== 'string' || 
        typeof payload.username !== 'string' || 
        typeof payload.exp !== 'number' || 
        typeof payload.iss !== 'string') {
      throw new InvalidTokenException();
    }
  }

  private extractBearerToken(tokenValue: string): string {
    if (tokenValue.startsWith('Bearer ')) {
      return tokenValue.substring(7);
    }
    return tokenValue;
  }
}