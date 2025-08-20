import { Injectable, Inject } from '@nestjs/common';
import type { ITokenValidationPort } from '../../domain/ports/token-validation.port';
import type { IExternalTokenValidationPort } from '../../domain/ports/external-token-validation.port';
import { TokenValidationDomainService } from '../../domain/services/token-validation.domain-service';
import { TokenValidationResponseDto, UserInfoDto } from '../dtos/token-validation-response.dto';
import { MissingTokenException, InvalidTokenException, ExternalValidationException, UpstreamHttpException } from '../../domain/exceptions/token.exception';
import type { ILoggerPort } from '../../../../shared/domain/ports/logger.port';

@Injectable()
export class ValidateTokenUseCase {
  constructor(
    @Inject('ITokenValidationPort')
    private readonly tokenValidationPort: ITokenValidationPort,
    @Inject('IExternalTokenValidationPort')
    private readonly externalTokenValidationPort: IExternalTokenValidationPort,
    private readonly tokenValidationDomainService: TokenValidationDomainService,
    @Inject('ILoggerPort')
    private readonly logger: ILoggerPort,
  ) {};

  async execute(tokenValue: string | undefined): Promise<TokenValidationResponseDto> {
    if (!tokenValue) {
      throw new MissingTokenException();
    }

    const token = await this.tokenValidationPort.validateToken(tokenValue);
    
    if (!token) {
      throw new InvalidTokenException();
    }

    const isValid = this.tokenValidationDomainService.validateTokenBusinessRules(token);
    
    if (!isValid) {
      this.logger.error('Token validation failed - business rules not met', undefined, 'ValidateTokenUseCase');
    }
    
    try {
      const validatedToken = await this.externalTokenValidationPort.validateAndRenewToken(tokenValue);
      
      const userInfo = new UserInfoDto(
        token.sub,
        token.username
      );
      
      this.logger.log('Token validation completed successfully', 'ValidateTokenUseCase');
      return new TokenValidationResponseDto(
        'Validación de token exitosa',
        userInfo,
        validatedToken
      );
    } catch (error: unknown) {
      if (error instanceof UpstreamHttpException) {
        this.logger.error(`Upstream API error: ${error.status} - ${error.message}`, undefined, 'ValidateTokenUseCase');
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('External token validation failed', error instanceof Error ? error.stack : undefined, 'ValidateTokenUseCase');
      throw new ExternalValidationException(errorMessage);
    }
  }
}