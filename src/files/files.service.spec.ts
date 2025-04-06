import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import * as fs from 'fs';
import * as path from 'path';
import { NotFoundException } from '@nestjs/common';

jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    promises: {
        readFile: jest.fn(),
    },
    existsSync: jest.fn(),
}));

describe('FilesService', () => {
    let service: FilesService;
    const mockBasePath = path.join('C:', 'mock', 'path', 'data_storage');

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [FilesService],
        }).compile();

        service = module.get<FilesService>(FilesService);
        service._setBasePath(mockBasePath);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getPoster', () => {
        it('should return file buffer for existing poster', async () => {
            const mockBuffer = Buffer.from('test');
            (fs.promises.readFile as jest.Mock).mockResolvedValue(mockBuffer);
            (fs.existsSync as jest.Mock).mockReturnValue(true);

            const result = await service.getPoster('test.jpg');
            expect(result).toBe(mockBuffer);
            const expectedPath = path.join(mockBasePath, 'images', 'posters', 'test.jpg');
            const actualPath = (fs.promises.readFile as jest.Mock).mock.calls[0][0];
            expect(actualPath).toBe(expectedPath);
        });

        it('should throw NotFoundException for non-existent poster', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);

            await expect(service.getPoster('nonexistent.jpg')).rejects.toThrow(NotFoundException);
        });
    });

    describe('getStill', () => {
        it('should return file buffer for existing still', async () => {
            const mockBuffer = Buffer.from('test');
            (fs.promises.readFile as jest.Mock).mockResolvedValue(mockBuffer);
            (fs.existsSync as jest.Mock).mockReturnValue(true);

            const result = await service.getStill('test.jpg');
            expect(result).toBe(mockBuffer);
            const expectedPath = path.join(mockBasePath, 'images', 'stills', 'test.jpg');
            const actualPath = (fs.promises.readFile as jest.Mock).mock.calls[0][0];
            expect(actualPath).toBe(expectedPath);
        });

        it('should throw NotFoundException for non-existent still', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);

            await expect(service.getStill('nonexistent.jpg')).rejects.toThrow(NotFoundException);
        });
    });

    describe('getVideo', () => {
        it('should return file buffer for existing video', async () => {
            const mockBuffer = Buffer.from('test');
            (fs.promises.readFile as jest.Mock).mockResolvedValue(mockBuffer);
            (fs.existsSync as jest.Mock).mockReturnValue(true);

            const result = await service.getVideo('test.mp4');
            expect(result).toBe(mockBuffer);
            const expectedPath = path.join(mockBasePath, 'videos', 'test.mp4');
            const actualPath = (fs.promises.readFile as jest.Mock).mock.calls[0][0];
            expect(actualPath).toBe(expectedPath);
        });

        it('should throw NotFoundException for non-existent video', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);

            await expect(service.getVideo('nonexistent.mp4')).rejects.toThrow(NotFoundException);
        });
    });
}); 