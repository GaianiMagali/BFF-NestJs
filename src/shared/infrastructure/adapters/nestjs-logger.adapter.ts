import { Injectable, Logger } from '@nestjs/common';
import { ILoggerPort } from '../../domain/ports/logger.port';

@Injectable()
export class NestJSLoggerAdapter implements ILoggerPort {
  private readonly logger = new Logger();

  log(message: string, context?: string): void {
    this.logger.log(message, context);
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, trace, context);
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, context);
  }
}