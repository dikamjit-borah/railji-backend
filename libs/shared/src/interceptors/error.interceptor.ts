import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();

        let statusCode = 500;
        let message = 'Internal Server Error';
        const errorMessage = error.message || 'An unexpected error occurred';

        if (error instanceof HttpException) {
          statusCode = error.getStatus();
          const errorResponse = error.getResponse();
          message =
            typeof errorResponse === 'string'
              ? errorResponse
              : (errorResponse as any).message || 'Error';
        } else {
          this.logger.error(
            `Unhandled Exception: ${error.message}`,
            error.stack,
            'ErrorInterceptor',
          );
        }

        const errorResponse: ErrorResponse = {
          success: false,
          statusCode,
          message,
          error: errorMessage,
          timestamp: new Date().toISOString(),
          path: request.url,
        };

        response.status(statusCode).json(errorResponse);
        return throwError(() => error);
      }),
    );
  }
}
