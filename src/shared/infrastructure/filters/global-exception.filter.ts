import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseDto } from '../../application/dtos/error-response.dto';
import type { IExceptionMapper } from '../exception-mappers/exception-mapper.interface';
import { DomainExceptionMapper } from '../exception-mappers/domain-exception.mapper';
import { HttpExceptionMapper } from '../exception-mappers/http-exception.mapper';
import { DefaultExceptionMapper } from '../exception-mappers/default-exception.mapper';

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly mappers: IExceptionMapper<any>[];

  constructor(
    private readonly authExceptionMapper: IExceptionMapper<any>,
    private readonly domainExceptionMapper: DomainExceptionMapper,
    private readonly httpExceptionMapper: HttpExceptionMapper,
    private readonly defaultExceptionMapper: DefaultExceptionMapper,
  ) {
    this.mappers = [
      this.authExceptionMapper,  // Specific auth exceptions first
      this.domainExceptionMapper,
      this.httpExceptionMapper,
      this.defaultExceptionMapper, // Must be last (fallback)
    ];
  }

  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const mapper = this.findMapper(exception);
    const errorDetail = mapper.mapToErrorDetail(exception);
    
    const errorResponse = new ErrorResponseDto(request.url, errorDetail);

    // Log the error (could be injected logger service)
    console.error(`[GlobalExceptionFilter] ${exception.name}:`, {
      message: exception.message,
      stack: exception.stack,
      url: request.url,
      method: request.method,
    });

    response.status(errorDetail.statusCode).json(errorResponse);
  }

  private findMapper(exception: Error): IExceptionMapper<any> {
    return this.mappers.find(mapper => mapper.canHandle(exception)) || this.defaultExceptionMapper;
  }
}