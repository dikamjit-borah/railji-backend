import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class LoggerServiceProvider implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.initializeLogger();
  }

  private initializeLogger(): void {
    const logsDir = 'logs';
    if (!existsSync(logsDir)) {
      mkdirSync(logsDir);
    }

    const isDevelopment = process.env.NODE_ENV === 'development';

    const transports: winston.transport[] = [
      new DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: process.env.LOG_MAX_FILES || '14',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaString = Object.keys(meta).length
              ? JSON.stringify(meta)
              : '';
            return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`;
          }),
        ),
      }),
      new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: '20m',
        maxFiles: process.env.LOG_MAX_FILES || '14',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(
            ({ timestamp, level, message, stack, ...meta }) => {
              const metaString = Object.keys(meta).length
                ? JSON.stringify(meta)
                : '';
              return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack || ''}\n${metaString}`;
            },
          ),
        ),
      }),
    ];

    if (isDevelopment) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const metaString = Object.keys(meta).length
                ? JSON.stringify(meta)
                : '';
              return `${timestamp} [${level}]: ${message} ${metaString}`;
            }),
          ),
        }),
      );
    }

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      transports,
    });
  }

  log(message: string, context?: string, meta?: any) {
    this.logger.info(message, { context, ...meta });
  }

  error(message: string, trace?: string, context?: string, meta?: any) {
    this.logger.error(message, { context, stack: trace, ...meta });
  }

  warn(message: string, context?: string, meta?: any) {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: any) {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: any) {
    this.logger.info(message, { context, level: 'verbose', ...meta });
  }
}
