import { DomainException } from './domain.exception';

export class ValidationException extends DomainException {
  readonly code = 'VALIDATION_ERROR';

  constructor(
    field: string,
    reason: string,
    details?: Record<string, any>
  ) {
    super(`Validation failed for field '${field}': ${reason}`, details);
  }
}