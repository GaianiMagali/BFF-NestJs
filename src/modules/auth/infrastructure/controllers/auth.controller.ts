import { Controller, Get, UseGuards, Req, Inject } from '@nestjs/common';
import { Request } from 'express';
import { TokenValidationGuard } from '../guards/token-validation.guard';
import { ValidateTokenUseCase } from '../../application/use-cases/validate-token.use-case';
import { TokenValidationResponseDto } from '../../application/dtos/token-validation-response.dto';
import type { ILoggerPort } from '../../../../shared/domain/ports/logger.port';

interface RequestWithTokenData extends Request {
  tokenValue: string;
}

@Controller()
export class AuthController {
  constructor(
    private readonly validateTokenUseCase: ValidateTokenUseCase,
    @Inject('ILoggerPort')
    private readonly logger: ILoggerPort,
  ) {}
  
  @Get()
  @UseGuards(TokenValidationGuard)
  async validateToken(@Req() req: RequestWithTokenData): Promise<TokenValidationResponseDto> {
    return await this.validateTokenUseCase.execute(req.tokenValue);
  }
}