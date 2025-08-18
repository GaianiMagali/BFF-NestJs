
export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

export class TokenExpiredException extends DomainException {
  constructor(message: string = 'Token has expired') {
    super(message);
    this.name = 'TokenExpiredException';
  }
}

export class InvalidTokenException extends DomainException {
  constructor(message: string = 'Token is invalid or malformed') {
    super(message);
    this.name = 'InvalidTokenException';
  }
}

export class TokenNotFoundException extends DomainException {
  constructor(message: string = 'Authorization token not provided') {
    super(message);
    this.name = 'TokenNotFoundException';
  }
}