import { TokenValidationResponse } from '../types/common.types';

export interface IExternalApiClient {
    validateAndRefreshToken(token: string): Promise<TokenValidationResponse>;
}