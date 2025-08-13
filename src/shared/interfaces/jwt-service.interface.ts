import { JwtDecoded } from '../types/common.types';

export interface IJwtService {
    decode(token: string): JwtDecoded | null;
    verify(token: string, secret: string): boolean;
    isExpired(token: string): boolean;
    getExpirationDate(token: string): Date | null;
}