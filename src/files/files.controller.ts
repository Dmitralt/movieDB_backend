import { Controller, Get, Param, Res, NotFoundException, Headers, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { FilesService } from './files.service';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    private handleFileError(error: Error): never {
        if (error.message.includes('ENOENT')) {
            throw new NotFoundException('File not found');
        }
        if (error.message.includes('EACCES') || error.message.includes('EPERM')) {
            throw new ForbiddenException('Access to file denied');
        }
        throw new InternalServerErrorException('Error accessing file');
    }

    @Get('posters/:filename')
    async getPoster(@Param('filename') filename: string, @Res() res: Response) {
        try {
            const file = await this.filesService.getPoster(filename);
            res.setHeader('Content-Type', 'image/jpeg');
            res.send(file);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.handleFileError(error as Error);
        }
    }

    @Get('stills/:filename')
    async getStill(@Param('filename') filename: string, @Res() res: Response) {
        try {
            const file = await this.filesService.getStill(filename);
            res.setHeader('Content-Type', 'image/jpeg');
            res.send(file);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.handleFileError(error as Error);
        }
    }

    @Get('videos/:filename')
    async getVideo(
        @Param('filename') filename: string,
        @Res() res: Response,
        @Headers('range') range: string
    ) {
        try {
            const filePath = path.join(process.cwd(), 'data_storage', 'videos', filename);

            if (!fs.existsSync(filePath)) {
                throw new NotFoundException('Video not found');
            }

            const stat = fs.statSync(filePath);
            const fileSize = stat.size;

            if (range) {
                // Handle range request for streaming
                const parts = range.replace(/bytes=/, '').split('-');
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

                if (start >= fileSize || end >= fileSize) {
                    throw new NotFoundException('Range not satisfiable');
                }

                const chunksize = (end - start) + 1;
                const file = fs.createReadStream(filePath, { start, end });

                const head = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': 'video/mp4',
                };

                res.writeHead(206, head);
                file.pipe(res);
            } else {
                // Handle full file request
                const head = {
                    'Content-Length': fileSize,
                    'Content-Type': 'video/mp4',
                };

                res.writeHead(200, head);
                fs.createReadStream(filePath).pipe(res);
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.handleFileError(error as Error);
        }
    }
} 