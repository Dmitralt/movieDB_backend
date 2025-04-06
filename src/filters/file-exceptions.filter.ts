import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';

@Catch()
export class FileExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            response.status(status).json({
                statusCode: status,
                message: exception.message,
                timestamp: new Date().toISOString(),
            });
            return;
        }

        // Handle file system errors
        if (exception instanceof Error) {
            if (exception.message.includes('ENOENT')) {
                response.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'File not found',
                    timestamp: new Date().toISOString(),
                });
                return;
            }

            if (exception.message.includes('EACCES') || exception.message.includes('EPERM')) {
                response.status(HttpStatus.FORBIDDEN).json({
                    statusCode: HttpStatus.FORBIDDEN,
                    message: 'Access to file denied',
                    timestamp: new Date().toISOString(),
                });
                return;
            }

            if (exception.message.includes('ENOSPC')) {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Insufficient storage space',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
        }

        // Handle unknown errors
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Internal server error',
            timestamp: new Date().toISOString(),
        });
    }
} 