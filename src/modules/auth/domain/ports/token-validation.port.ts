import { Token } from '../entities/token.entity';

export interface ITokenValidationPort {
  validateToken(tokenValue: string): Promise<Token | null>;
}