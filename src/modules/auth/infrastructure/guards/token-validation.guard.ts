import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import type { ILoggerPort } from '../../../../shared/domain/ports/logger.port';

interface RequestWithTokenData extends Request {
  tokenValue: string;
}

@Injectable()
export class TokenValidationGuard implements CanActivate {

  constructor(
    @Inject('ILoggerPort')
    private readonly logger: ILoggerPort
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithTokenData>();
    
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Se requiere un token pero no fue proporcionado');
    }
    
    request.tokenValue = `Bearer ${token}`;
    this.logger.debug('Token extracted and added to request', 'TokenValidationGuard');
    return true;
  }

  private extractTokenFromHeader(request: RequestWithTokenData): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    
    return type === 'Bearer' ? token : undefined;
  }
}