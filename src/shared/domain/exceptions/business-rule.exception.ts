import { DomainException } from './domain.exception';

export class BusinessRuleException extends DomainException {
  readonly code = 'BUSINESS_RULE_VIOLATION';

  constructor(
    rule: string,
    details?: Record<string, any>
  ) {
    super(`Business rule violation: ${rule}`, details);
  }
}