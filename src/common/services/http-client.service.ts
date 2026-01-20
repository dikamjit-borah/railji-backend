import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class HttpClientInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpClientInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        // This interceptor can be used to intercept and log external HTTP calls
        // when integrated with a custom HTTP client service
      }),
    );
  }
}

@Injectable()
export class HttpClientService {
  private readonly logger = new Logger(HttpClientService.name);

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const startTime = Date.now();
    try {
      this.logger.log(`GET request to ${url}`);
      const response = await axios.get<T>(url, config);
      const duration = Date.now() - startTime;
      this.logger.debug(`GET ${url} - ${response.status} - ${duration}ms`);
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `GET ${url} failed after ${duration}ms: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const startTime = Date.now();
    try {
      this.logger.log(`POST request to ${url}`);
      const response = await axios.post<T>(url, data, config);
      const duration = Date.now() - startTime;
      this.logger.debug(`POST ${url} - ${response.status} - ${duration}ms`);
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `POST ${url} failed after ${duration}ms: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const startTime = Date.now();
    try {
      this.logger.log(`PUT request to ${url}`);
      const response = await axios.put<T>(url, data, config);
      const duration = Date.now() - startTime;
      this.logger.debug(`PUT ${url} - ${response.status} - ${duration}ms`);
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `PUT ${url} failed after ${duration}ms: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const startTime = Date.now();
    try {
      this.logger.log(`DELETE request to ${url}`);
      const response = await axios.delete<T>(url, config);
      const duration = Date.now() - startTime;
      this.logger.debug(`DELETE ${url} - ${response.status} - ${duration}ms`);
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `DELETE ${url} failed after ${duration}ms: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
