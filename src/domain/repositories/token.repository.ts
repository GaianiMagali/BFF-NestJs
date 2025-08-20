import { Token } from '../entities/token.entity';

export interface ITokenRepository {
  validateToken(tokenValue: string): Promise<Token | null>;
}