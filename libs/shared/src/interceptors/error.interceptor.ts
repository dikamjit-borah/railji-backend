import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class ErrorInterceptor implements ExceptionFilter {
  private readonly logger = new Logger(ErrorInterceptor.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    // Debug logging
    this.logger.debug(`Exception type: ${exception?.constructor?.name}`);
    this.logger.debug(`instanceof HttpException: ${exception instanceof HttpException}`);
    this.logger.debug(`Has getStatus: ${typeof exception?.getStatus === 'function'}`);

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: string | undefined;

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
        error = exception.name;
      } else if (typeof res === 'object') {
        message = (res as any).message || exception.message;
        error = (res as any).error || exception.name;
      }
    } else if (typeof exception?.getStatus === 'function') {
      // Fallback: if it has getStatus method but instanceof failed
      httpStatus = exception.getStatus();
      const res = exception.getResponse?.();
      if (typeof res === 'string') {
        message = res;
        error = exception.name;
      } else if (typeof res === 'object') {
        message = (res as any).message || exception.message;
        error = (res as any).error || exception.name;
      } else {
        message = exception.message || message;
        error = exception.name;
      }
    } else if (exception?.message) {
      message = exception.message;
      error = exception.name;
    }

    if (httpStatus >= 500) {
      this.logger.error(`${request.method} ${request.url} - ${httpStatus} - ${message}`, exception.stack);
    } else {
      this.logger.warn(`${request.method} ${request.url} - ${httpStatus} - ${message}`);
    }

    httpAdapter.reply(ctx.getResponse(), {
      success: false,
      statusCode: httpStatus,
      message,
      ...(error && { error }),
      timestamp: new Date().toISOString(),
      path: request.url,
    }, httpStatus);
  }
}

export interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
  path: string;
}
