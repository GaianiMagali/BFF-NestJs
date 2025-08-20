import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class TokenExpiredException extends DomainException {
  readonly code = 'TOKEN_EXPIRED';

  constructor() {
    super('El token ha expirado');
  }
}

export class InvalidTokenClaimsException extends DomainException {
  readonly code = 'INVALID_TOKEN_CLAIMS';

  constructor() {
    super('El token no tiene los claims requeridos');
  }
}

export class MissingTokenException extends DomainException {
  readonly code = 'MISSING_TOKEN';

  constructor() {
    super('Se requiere un token pero no fue proporcionado');
  }
}

export class InvalidTokenException extends DomainException {
  readonly code = 'INVALID_TOKEN';

  constructor() {
    super('Token inválido');
  }
}

export class ExternalValidationException extends DomainException {
  readonly code = 'EXTERNAL_VALIDATION_FAILED';

  constructor(reason: string) {
    super(`Falló la validación con API externa: ${reason}`);
  }
}

export class UpstreamHttpException extends DomainException {
  readonly code = 'UPSTREAM_HTTP_ERROR';

  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
  }
}