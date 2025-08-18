import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
import { Token } from '../../domain/entities/token.entity';
import { ValidateTokenUseCase } from '../../application/use-cases/validate-token.use-case';

// Extensión del Request para incluir la información inyectada por el guard
interface RequestWithTokenData extends Request {
  user: Token;
  userInfo?: any;
  message?: string;
}

/**
 * GUARD DE VALIDACIÓN DE TOKENS - Capa de Infraestructura
 * 
 * Protege los endpoints HTTP verificando que el token del header
 * Authorization sea válido y no esté vencido.
 * Se ejecuta antes de llegar al controlador.
 */
@Injectable()
export class TokenValidationGuard implements CanActivate {
  constructor(private readonly validateTokenUseCase: ValidateTokenUseCase) {}

  /**
   * Método principal que determina si el request puede continuar
   * @param context - Contexto de ejecución de NestJS
   * @returns true si el token es válido, false en caso contrario
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithTokenData>();
    const token = this.extractTokenFromHeader(request);

    // Ejecutar la validación del token usando el caso de uso
    const result = await this.validateTokenUseCase.execute(token);
    
    // Si es válido, agregar toda la información al request
    if (result.isValid && result.token) {
      request.user = result.token;        // Token decodificado
      request.userInfo = result.userInfo; // Info de API externa (si existe)
      request.message = result.message;   // Mensaje del resultado
      return true;
    }
    
    // Si no es válido, las excepciones se manejan en el filter global
    return false;
  }

  /**
   * Extrae el token del header Authorization
   * @param request - Request HTTP entrante
   * @returns Token JWT o undefined si no existe
   */
  private extractTokenFromHeader(request: RequestWithTokenData): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}