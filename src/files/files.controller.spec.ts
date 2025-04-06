import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    existsSync: jest.fn(),
    statSync: jest.fn(),
    createReadStream: jest.fn(),
}));

jest.mock('path', () => ({
    ...jest.requireActual('path'),
    join: jest.fn((...args) => args.join('/')),
}));

describe('FilesController', () => {
    let controller: FilesController;
    let service: FilesService;
    let mockResponse: Partial<Response>;
    const mockBasePath = '/mock/path';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FilesController],
            providers: [
                {
                    provide: FilesService,
                    useValue: {
                        getPoster: jest.fn(),
                        getStill: jest.fn(),
                        getVideo: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<FilesController>(FilesController);
        service = module.get<FilesService>(FilesService);
        mockResponse = {
            setHeader: jest.fn(),
            send: jest.fn(),
            writeHead: jest.fn(),
            pipe: jest.fn(),
        };

        // Mock process.cwd
        Object.defineProperty(process, 'cwd', {
            value: jest.fn().mockReturnValue(mockBasePath),
            writable: true
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        // Restore original process.cwd
        Object.defineProperty(process, 'cwd', {
            value: jest.requireActual('process').cwd,
            writable: true
        });
    });

    describe('getPoster', () => {
        it('should return poster file', async () => {
            const mockBuffer = Buffer.from('test');
            jest.spyOn(service, 'getPoster').mockResolvedValue(mockBuffer);

            await controller.getPoster('test.jpg', mockResponse as Response);

            expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
            expect(mockResponse.send).toHaveBeenCalledWith(mockBuffer);
        });

        it('should handle NotFoundException', async () => {
            jest.spyOn(service, 'getPoster').mockRejectedValue(new NotFoundException());

            await expect(controller.getPoster('nonexistent.jpg', mockResponse as Response))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('getStill', () => {
        it('should return still file', async () => {
            const mockBuffer = Buffer.from('test');
            jest.spyOn(service, 'getStill').mockResolvedValue(mockBuffer);

            await controller.getStill('test.jpg', mockResponse as Response);

            expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
            expect(mockResponse.send).toHaveBeenCalledWith(mockBuffer);
        });

        it('should handle NotFoundException', async () => {
            jest.spyOn(service, 'getStill').mockRejectedValue(new NotFoundException());

            await expect(controller.getStill('nonexistent.jpg', mockResponse as Response))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('getVideo', () => {
        const mockStat = {
            size: 1000,
        };

        beforeEach(() => {
            (fs.statSync as jest.Mock).mockReturnValue(mockStat);
            (fs.createReadStream as jest.Mock).mockReturnValue({
                pipe: jest.fn(),
            });
        });

        it('should stream video file without range', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);

            await controller.getVideo('test.mp4', mockResponse as Response, undefined);

            expect(mockResponse.writeHead).toHaveBeenCalledWith(200, {
                'Content-Length': 1000,
                'Content-Type': 'video/mp4',
            });
        });

        it('should stream video file with range', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            const range = 'bytes=0-499';

            await controller.getVideo('test.mp4', mockResponse as Response, range);

            expect(mockResponse.writeHead).toHaveBeenCalledWith(206, {
                'Content-Range': 'bytes 0-499/1000',
                'Accept-Ranges': 'bytes',
                'Content-Length': 500,
                'Content-Type': 'video/mp4',
            });
        });

        it('should handle NotFoundException for non-existent video', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);

            await expect(controller.getVideo('nonexistent.mp4', mockResponse as Response, undefined))
                .rejects.toThrow(NotFoundException);
        });

        it('should handle NotFoundException for invalid range', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            const range = 'bytes=2000-3000'; // Range beyond file size

            await expect(controller.getVideo('test.mp4', mockResponse as Response, range))
                .rejects.toThrow(NotFoundException);
        });

        it('should handle file system errors', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.statSync as jest.Mock).mockImplementation(() => {
                throw new Error('EACCES');
            });

            await expect(controller.getVideo('test.mp4', mockResponse as Response, undefined))
                .rejects.toThrow(ForbiddenException);
        });
    });
}); 