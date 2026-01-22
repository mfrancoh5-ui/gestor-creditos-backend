import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseDto } from '../dto/response.dto';
import { LoggerService } from '../logger/logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(@Inject(LoggerService) private logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let errors: Record<string, string[]> | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const obj = exceptionResponse as Record<string, any>;
        message = obj.message || exception.message;

        // Validaciones (BadRequest)
        if (exception instanceof BadRequestException) {
          if (Array.isArray(obj.message)) {
            errors = this.formatValidationErrors(obj.message as any[]);
            message = 'Validación fallida';
          }
        }
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message || 'Error no especificado';
    }

    const payload: ErrorResponseDto = {
      success: false,
      statusCode,
      data: null,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(errors && { errors }),
    };

    // Log HTTP error con requestId
    const requestId = (request as any).requestId || 'unknown';
    this.logger.httpError(
      request.method,
      request.url,
      statusCode,
      message,
      requestId,
      exception instanceof Error ? exception : undefined,
    );

    response.status(statusCode).json(payload);
  }

  private formatValidationErrors(errors: any[]): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};
    for (const e of errors) {
      if (e.property && e.constraints) {
        formatted[e.property] = Object.values(e.constraints) as string[];
      }
    }
    return formatted;
  }
}

