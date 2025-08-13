import { HttpRequestConfig, ApiResponse } from '../types/common.types';

export interface IHttpClient {
    request<T = any>(config: HttpRequestConfig): Promise<ApiResponse<T>>;
    get<T = any>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>>;
    post<T = any>(url: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>>;
}