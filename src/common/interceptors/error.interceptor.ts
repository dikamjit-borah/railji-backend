import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { isEmpty } from 'lodash';

/**
 * The AllExceptionFilter filters all the uncaught exceptions generated
 * through the application
 */
@Catch()
export class AllExceptionFilter implements ExceptionFilter {
    /**
     * The parameterized constructor
     * @param httpAdapterHost {@link HttpAdapterHost}
     * @param requestContextProvider {@link RequestContextService}
     */
    constructor(
        private readonly httpAdapterHost: HttpAdapterHost,
        //private readonly requestContextProvider: RequestContextService,
    ) {}

    /**
     * ExceptionFilter catch method, handles all the uncaught exceptions
     * generated throughout the application.
     * The uncaught exceptions returned with a standard format
     *
     * @param exception any
     * @param host ArgumentsHost
     */
    catch(exception: any, host: ArgumentsHost) {
        const { httpAdapter } = this.httpAdapterHost;

        const ctx = host.switchToHttp();
        const message = isEmpty(exception?.message) ? exception : JSON.stringify(exception?.message);
        //const stack = isEmpty(exception?.stack) ? exception : exception.stack;
        const errorMessage = message ? { message } : { message: 'Something went wrong' };
        const errorResponse = exception?.response ? exception?.response : errorMessage;
        const error = {
            ...errorResponse,
            //stack,
        };
        const httpStatus =
            exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const responseBody = {
            success: false,
            message,
            statusCode: httpStatus,
            time: new Date().toISOString(),
            identifier: this.requestContextProvider.get('requestId'),
            error,
        };
        Logger.log('API  Error response', JSON.stringify(responseBody));
        Logger.error(`Exception caught by AllExceptionFilter: ${message}`, exception.stack);

        //this.serviceRequestLogger.logRequest(ctx, responseBody);

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}
