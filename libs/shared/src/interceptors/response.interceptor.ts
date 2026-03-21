import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  statusCode?: number;
  message: string;
  data?: T;
  timestamp: string;
  path: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // If data contains a statusCode, use it to set the response status
        if (data?.statusCode) {
          response.status(data.statusCode);
        }
        
        const statusCode = response.statusCode;

        return {
          success: statusCode >= 200 && statusCode < 300,
          statusCode,
          message: data?.message || 'Success',
          data: data?.data || data,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}
