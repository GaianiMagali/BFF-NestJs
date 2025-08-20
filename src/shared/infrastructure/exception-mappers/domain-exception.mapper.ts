import { Injectable, HttpStatus } from '@nestjs/common';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { ValidationException } from '../../domain/exceptions/validation.exception';
import { BusinessRuleException } from '../../domain/exceptions/business-rule.exception';
import { ErrorDetailDto } from '../../application/dtos/error-response.dto';
import { IExceptionMapper } from './exception-mapper.interface';

@Injectable()
export class DomainExceptionMapper implements IExceptionMapper<DomainException> {
  
  canHandle(exception: Error): exception is DomainException {
    return exception instanceof DomainException;
  }

  mapToErrorDetail(exception: DomainException): ErrorDetailDto {
    const statusCode = this.getHttpStatusCode(exception);
    
    return new ErrorDetailDto(
      exception.code,
      exception.message,
      statusCode,
      exception.details
    );
  }

  private getHttpStatusCode(exception: DomainException): number {
    if (exception instanceof ValidationException) {
      return HttpStatus.BAD_REQUEST;
    }
    
    if (exception instanceof BusinessRuleException) {
      return HttpStatus.UNPROCESSABLE_ENTITY;
    }

    return HttpStatus.BAD_REQUEST;
  }
}