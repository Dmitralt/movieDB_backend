import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { FileExceptionsFilter } from './file-exceptions.filter';
import { Response } from 'express';

describe('FileExceptionsFilter', () => {
    let filter: FileExceptionsFilter;
    let mockResponse: Partial<Response>;
    let mockHost: Partial<ArgumentsHost>;

    beforeEach(() => {
        filter = new FileExceptionsFilter();
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockHost = {
            switchToHttp: jest.fn().mockReturnValue({
                getResponse: jest.fn().mockReturnValue(mockResponse),
            }),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should handle HttpException', () => {
        const exception = new HttpException('Test message', HttpStatus.BAD_REQUEST);
        filter.catch(exception, mockHost as ArgumentsHost);

        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
        expect(mockResponse.json).toHaveBeenCalledWith({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Test message',
            timestamp: expect.any(String),
        });
    });

    it('should handle ENOENT error', () => {
        const error = new Error('ENOENT: no such file or directory');
        filter.catch(error, mockHost as ArgumentsHost);

        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
        expect(mockResponse.json).toHaveBeenCalledWith({
            statusCode: HttpStatus.NOT_FOUND,
            message: 'File not found',
            timestamp: expect.any(String),
        });
    });

    it('should handle EACCES error', () => {
        const error = new Error('EACCES: permission denied');
        filter.catch(error, mockHost as ArgumentsHost);

        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
        expect(mockResponse.json).toHaveBeenCalledWith({
            statusCode: HttpStatus.FORBIDDEN,
            message: 'Access to file denied',
            timestamp: expect.any(String),
        });
    });

    it('should handle EPERM error', () => {
        const error = new Error('EPERM: operation not permitted');
        filter.catch(error, mockHost as ArgumentsHost);

        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
        expect(mockResponse.json).toHaveBeenCalledWith({
            statusCode: HttpStatus.FORBIDDEN,
            message: 'Access to file denied',
            timestamp: expect.any(String),
        });
    });

    it('should handle ENOSPC error', () => {
        const error = new Error('ENOSPC: no space left on device');
        filter.catch(error, mockHost as ArgumentsHost);

        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(mockResponse.json).toHaveBeenCalledWith({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Insufficient storage space',
            timestamp: expect.any(String),
        });
    });

    it('should handle unknown error', () => {
        const error = new Error('Unknown error');
        filter.catch(error, mockHost as ArgumentsHost);

        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(mockResponse.json).toHaveBeenCalledWith({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Internal server error',
            timestamp: expect.any(String),
        });
    });
}); 