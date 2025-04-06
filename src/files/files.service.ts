import { Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FilesService {
  private readonly basePath: string;

  constructor() {
    this.basePath = path.join(process.cwd(), 'data_storage');
  }

  async getPoster(filename: string): Promise<Buffer> {
    const filePath = path.join(this.basePath, 'images', 'posters', filename);
    return this.getFile(filePath);
  }

  async getStill(filename: string): Promise<Buffer> {
    const filePath = path.join(this.basePath, 'images', 'stills', filename);
    return this.getFile(filePath);
  }

  async getVideo(filename: string): Promise<Buffer> {
    const filePath = path.join(this.basePath, 'videos', filename);
    return this.getFile(filePath);
  }

  private async getFile(filePath: string): Promise<Buffer> {
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }
    return fs.promises.readFile(filePath);
  }

  _setBasePath(path: string) {
    Object.defineProperty(this, 'basePath', {
      value: path,
      writable: true,
    });
  }
}
