import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ITokenRepository } from '../../../domain/repositories/token.repository';
import { Token } from '../../../domain/entities/token.entity';

@Injectable()
export class JwtAdapter implements ITokenRepository {
  private readonly secret = process.env.JWT_SECRET || 'default-secret';

  async validateToken(tokenValue: string): Promise<Token | null> {
    try {
      const cleanToken = this.extractBearerToken(tokenValue);
      const decoded = jwt.verify(cleanToken, this.secret) as any;
      
      return new Token(
        cleanToken,
        new Date(decoded.iat * 1000),
        new Date(decoded.exp * 1000),
        decoded.sub || decoded.userId || 'unknown'
      );
    } catch (error) {
      return null;
    }
  }

  async decodeToken(tokenValue: string): Promise<Token | null> {
    try {
      const cleanToken = this.extractBearerToken(tokenValue);
      const decoded = jwt.decode(cleanToken) as any;
      
      if (!decoded || !decoded.exp) {
        return null;
      }

      return new Token(
        cleanToken,
        new Date(decoded.iat * 1000),
        new Date(decoded.exp * 1000),
        decoded.sub || decoded.userId || 'unknown'
      );
    } catch (error) {
      return null;
    }
  }

  private extractBearerToken(tokenValue: string): string {
    if (tokenValue.startsWith('Bearer ')) {
      return tokenValue.substring(7);
    }
    return tokenValue;
  }
}