import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

export interface ErrorHandlerOptions {
  context?: string;
  logStack?: boolean;
}

/**
 * Common error handler service for consistent error handling across the application
 * Logs errors and throws appropriate HTTP exceptions based on error type
 */
@Injectable()
export class ErrorHandlerService {
  private readonly logger = new Logger(ErrorHandlerService.name);

  /**
   * Handle errors with logging and appropriate HTTP exception throwing
   * @param error - The error object to handle
   * @param options - Optional configuration for error handling
   * @throws HttpException - Appropriate HTTP exception based on error type
   */
  handle(error: any, options: ErrorHandlerOptions = {}): never {
    const { context = 'Unknown', logStack = true } = options;

    // Log the error
    if (logStack && error?.stack) {
      this.logger.error(
        `[${context}] Error: ${error.message}`,
        error.stack,
      );
    } else {
      this.logger.error(`[${context}] Error: ${error.message}`);
    }

    // If it's already an HttpException, re-throw it
    if (error instanceof HttpException) {
      throw error;
    }

    // Handle specific error types
    if (error instanceof NotFoundException) {
      throw error;
    }

    if (error instanceof BadRequestException) {
      throw error;
    }

    if (error instanceof UnauthorizedException) {
      throw error;
    }

    if (error instanceof ForbiddenException) {
      throw error;
    }

    if (error instanceof ConflictException) {
      throw error;
    }

    // Handle MongoDB/Mongoose errors
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      if (error.code === 11000) {
        throw new ConflictException(
          `Duplicate entry: ${this.extractDuplicateField(error)}`,
        );
      }
      throw new InternalServerErrorException(
        'Database error occurred',
      );
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map((err: any) => err.message)
        .join(', ');
      throw new BadRequestException(messages || 'Validation failed');
    }

    if (error.name === 'CastError') {
      throw new BadRequestException(
        `Invalid ${error.path}: ${error.value}`,
      );
    }

    // Handle generic errors
    const message = error.message || 'An unexpected error occurred';
    throw new InternalServerErrorException(message);
  }

  /**
   * Extract duplicate field name from MongoDB duplicate key error
   */
  private extractDuplicateField(error: any): string {
    if (error.keyPattern) {
      return Object.keys(error.keyPattern)[0];
    }
    return 'unknown field';
  }

  /**
   * Handle not found errors
   */
  handleNotFound(resource: string, identifier?: string): never {
    const message = identifier
      ? `${resource} with ID ${identifier} not found`
      : `${resource} not found`;
    this.logger.warn(message);
    throw new NotFoundException(message);
  }

  /**
   * Handle validation errors
   */
  handleValidation(message: string): never {
    this.logger.warn(`Validation error: ${message}`);
    throw new BadRequestException(message);
  }

  /**
   * Handle unauthorized errors
   */
  handleUnauthorized(message: string = 'Unauthorized access'): never {
    this.logger.warn(message);
    throw new UnauthorizedException(message);
  }

  /**
   * Handle forbidden errors
   */
  handleForbidden(message: string = 'Access forbidden'): never {
    this.logger.warn(message);
    throw new ForbiddenException(message);
  }

  /**
   * Handle conflict errors
   */
  handleConflict(message: string): never {
    this.logger.warn(`Conflict: ${message}`);
    throw new ConflictException(message);
  }
}
