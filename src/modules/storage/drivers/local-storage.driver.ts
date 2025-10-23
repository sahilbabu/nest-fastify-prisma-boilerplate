import * as fs from 'fs/promises';
import * as path from 'path';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IStorageDriver } from './storage-driver.interface';

@Injectable()
export class LocalStorageDriver implements IStorageDriver {
  private readonly logger = new Logger(LocalStorageDriver.name);

  constructor(private readonly configService: ConfigService) {}

  private get storagePath(): string {
    return this.configService.get<string>('LOCAL_STORAGE_PATH') ?? './uploads';
  }

  async upload(file: Buffer, filename: string, _mimeType: string): Promise<{ path: string; url: string }> {
    try {
      await fs.mkdir(this.storagePath, { recursive: true });
      const filePath = path.join(this.storagePath, filename);
      await fs.writeFile(filePath, file);
      this.logger.log(`File uploaded: ${filename}`);
      return {
        path: filename,
        url: `/uploads/${filename}`,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${filename}`, error);
      throw error;
    }
  }

  async delete(filename: string): Promise<void> {
    try {
      const filePath = path.join(this.storagePath, filename);
      await fs.unlink(filePath);
      this.logger.log(`File deleted: ${filename}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${filename}`, error);
      throw error;
    }
  }

  async getUrl(filename: string, isPublic = true): Promise<string> {
    if (isPublic) {
      return Promise.resolve(`/uploads/${filename}`);
    }
    return Promise.resolve(`/uploads/private/${filename}`);
  }

  async exists(filename: string): Promise<boolean> {
    try {
      const filePath = path.join(this.storagePath, filename);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
