import { Injectable, HttpStatus } from '@nestjs/common';
import { ErrorDetailDto } from '../../../../shared/application/dtos/error-response.dto';
import { IExceptionMapper } from '../../../../shared/infrastructure/exception-mappers/exception-mapper.interface';
import { 
  TokenExpiredException, 
  InvalidTokenClaimsException, 
  MissingTokenException, 
  InvalidTokenException, 
  ExternalValidationException 
} from '../../domain/exceptions/token.exception';

@Injectable()
export class AuthExceptionMapper implements IExceptionMapper<any> {
  
  canHandle(exception: Error): exception is TokenExpiredException | InvalidTokenClaimsException | MissingTokenException | InvalidTokenException | ExternalValidationException {
    return exception instanceof TokenExpiredException ||
           exception instanceof InvalidTokenClaimsException ||
           exception instanceof MissingTokenException ||
           exception instanceof InvalidTokenException ||
           exception instanceof ExternalValidationException;
  }

  mapToErrorDetail(exception: any): ErrorDetailDto {
    const statusCode = this.getHttpStatusCode(exception);
    
    return new ErrorDetailDto(
      exception.code,
      exception.message,
      statusCode,
      exception.details
    );
  }

  private getHttpStatusCode(exception: any): number {
    if (exception instanceof TokenExpiredException ||
        exception instanceof InvalidTokenClaimsException ||
        exception instanceof InvalidTokenException) {
      return HttpStatus.UNAUTHORIZED;
    }
    
    if (exception instanceof MissingTokenException) {
      return HttpStatus.UNAUTHORIZED;
    }

    if (exception instanceof ExternalValidationException) {
      return HttpStatus.BAD_GATEWAY;
    }

    return HttpStatus.BAD_REQUEST;
  }
}