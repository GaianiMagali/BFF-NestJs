import { Injectable, HttpStatus } from '@nestjs/common';
import { ErrorDetailDto } from '../../application/dtos/error-response.dto';
import { IExceptionMapper } from './exception-mapper.interface';

@Injectable()
export class DefaultExceptionMapper implements IExceptionMapper<Error> {
  
  canHandle(exception: Error): exception is Error {
    return true; // Always handles as fallback
  }

  mapToErrorDetail(exception: Error): ErrorDetailDto {
    return new ErrorDetailDto(
      'INTERNAL_SERVER_ERROR',
      'An unexpected error occurred',
      HttpStatus.INTERNAL_SERVER_ERROR,
      process.env.NODE_ENV === 'development' ? { originalError: exception.message } : undefined
    );
  }
}