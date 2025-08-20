import { Injectable, HttpException } from '@nestjs/common';
import { ErrorDetailDto } from '../../application/dtos/error-response.dto';
import { IExceptionMapper } from './exception-mapper.interface';

@Injectable()
export class HttpExceptionMapper implements IExceptionMapper<HttpException> {
  
  canHandle(exception: Error): exception is HttpException {
    return exception instanceof HttpException;
  }

  mapToErrorDetail(exception: HttpException): ErrorDetailDto {
    const response = exception.getResponse();
    
    return new ErrorDetailDto(
      'HTTP_EXCEPTION',
      exception.message,
      exception.getStatus(),
      typeof response === 'object' ? response : undefined
    );
  }
}