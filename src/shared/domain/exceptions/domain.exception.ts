
export abstract class DomainException extends Error {
  abstract readonly code: string;
  
  constructor(
    message: string,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}