
export interface TokenPayload {
    sub: string;
    username: string;
    iat: number;
    exp: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface TokenValidationResult {
    isValid: boolean;
    isExpired: boolean;
    payload?: TokenPayload;
}

export interface TokenRenewalResponse {
    newToken: string;
    expiresAt: Date;
}