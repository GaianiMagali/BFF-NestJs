import { ErrorDetailDto } from '../../application/dtos/error-response.dto';

export interface IExceptionMapper<T extends Error> {
  canHandle(exception: Error): exception is T;
  mapToErrorDetail(exception: T): ErrorDetailDto;
}