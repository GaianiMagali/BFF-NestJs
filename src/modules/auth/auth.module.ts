import { Module } from '@nestjs/common';
import { ValidateTokenUseCase } from './application/use-cases/validate-token.use-case';
import { JwtAdapter } from './infrastructure/adapters/jwt.adapter';
import { TokenValidationAdapter } from './infrastructure/adapters/token-validation.adapter';
import { TokenValidationGuard } from './infrastructure/guards/token-validation.guard';
import { TokenValidationDomainService } from './domain/services/token-validation.domain-service';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { NestJSLoggerAdapter } from '../../shared/infrastructure/adapters/nestjs-logger.adapter';
import { AuthExceptionMapper } from './infrastructure/exception-mappers/auth-exception.mapper';

@Module({
  controllers: [AuthController],
  providers: [
    ValidateTokenUseCase,
    
    TokenValidationDomainService,
    
    {
      provide: 'ITokenValidationPort',
      useClass: JwtAdapter,
    },
    
    {
      provide: 'IExternalTokenValidationPort',
      useClass: TokenValidationAdapter,
    },
    
    {
      provide: 'ILoggerPort',
      useClass: NestJSLoggerAdapter,
    },
    
    AuthExceptionMapper,
    TokenValidationGuard,
  ],
  
  exports: [
    ValidateTokenUseCase,
    TokenValidationGuard,
    AuthExceptionMapper,
    'ITokenValidationPort',
    'ILoggerPort'
  ],
})

export class AuthModule {}