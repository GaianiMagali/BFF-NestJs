
export class ErrorResponseDto {
  readonly success: boolean = false;
  readonly timestamp: string;
  readonly path: string;
  readonly error: ErrorDetailDto;

  constructor(
    path: string,
    error: ErrorDetailDto
  ) {
    this.timestamp = new Date().toISOString();
    this.path = path;
    this.error = error;
  }
}

export class ErrorDetailDto {
  readonly code: string;
  readonly message: string;
  readonly statusCode: number;
  readonly details?: Record<string, any> | undefined;

  constructor(
    code: string,
    message: string,
    statusCode: number,
    details?: Record<string, any> | undefined
  ) {
    this.code = code;
    this.message = message;
    this.statusCode = statusCode;
    if (details !== undefined) {
      this.details = details;
    }
  }
}