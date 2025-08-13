
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface TokenValidationResponse {
    isValid: boolean;
    isExpired: boolean;
    newToken?: string;
    expiresAt?: Date;
}

export interface JwtDecoded {
    sub: string;
    iat: number;
    exp: number;
    [key: string]: any;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface HttpRequestConfig {
    url: string;
    method: HttpMethod;
    headers?: Record<string, string>;
    data?: any;
    timeout?: number;
}