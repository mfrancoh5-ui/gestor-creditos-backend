import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as pino from 'pino';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

@Injectable()
export class LoggerService {
  private logger: pino.Logger;

  constructor(private configService: ConfigService) {
    const logLevel = (
      this.configService.get<LogLevel>('LOG_LEVEL') || 'INFO'
    ).toLowerCase();

    this.logger = pino({
      level: logLevel,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          singleLine: false,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    });
  }

  debug(message: string, context?: Record<string, any>) {
    this.logger.debug(context, message);
  }

  info(message: string, context?: Record<string, any>) {
    this.logger.info(context, message);
  }

  warn(message: string, context?: Record<string, any>) {
    this.logger.warn(context, message);
  }

  error(message: string, error?: Error | Record<string, any>, context?: Record<string, any>) {
    if (error instanceof Error) {
      this.logger.error(
        {
          ...context,
          error: {
            message: error.message,
            stack: error.stack,
          },
        },
        message,
      );
    } else {
      this.logger.error({ ...error, ...context }, message);
    }
  }

  /**
   * Log HTTP request details (sin passwords/tokens)
   */
  httpRequest(
    method: string,
    path: string,
    statusCode: number,
    responseTime: number,
    requestId: string,
  ) {
    this.info('HTTP Request', {
      requestId,
      method,
      path,
      statusCode,
      responseTimeMs: responseTime,
    });
  }

  /**
   * Log HTTP error (sin passwords/tokens sensibles)
   */
  httpError(
    method: string,
    path: string,
    statusCode: number,
    message: string,
    requestId: string,
    error?: any,
  ) {
    this.error(`HTTP Error: ${statusCode}`, error, {
      requestId,
      method,
      path,
      statusCode,
      errorMessage: message,
    });
  }
}
