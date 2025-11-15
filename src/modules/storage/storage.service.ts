import { randomUUID } from 'crypto';
import * as path from 'path';

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';

import { AzureStorageDriver } from './drivers/azure-storage.driver';
import { LocalStorageDriver } from './drivers/local-storage.driver';
import { S3StorageDriver } from './drivers/s3-storage.driver';
import { IStorageDriver } from './drivers/storage-driver.interface';
import { WasabiStorageDriver } from './drivers/wasabi-storage.driver';
import { FileResponseDto } from './dto/file-response.dto';

import { PrismaService } from '@/src/core/prisma/prisma.service';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly driver: IStorageDriver;
  private readonly maxFileSizeMB: number;
  private readonly allowedMimeTypes: string[];
  private readonly storageDriver: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly localDriver: LocalStorageDriver,
    private readonly s3Driver: S3StorageDriver,
    private readonly wasabiDriver: WasabiStorageDriver,
    private readonly azureDriver: AzureStorageDriver,
  ) {
    this.storageDriver = this.configService.get<string>('STORAGE_DRIVER') ?? 'local';
    this.maxFileSizeMB = this.configService.get<number>('MAX_PHOTO_SIZE_MB') ?? 8;
    const allowedTypes =
      this.configService.get<string>('ALLOWED_PHOTO_TYPES') ??
      'image/jpeg,image/png,image/webp,image/heic';
    this.allowedMimeTypes = allowedTypes.split(',').map(t => t.trim());

    this.driver = this.getDriver();
  }

  private getDriver(): IStorageDriver {
    switch (this.storageDriver) {
      case 's3':
        return this.s3Driver;
      case 'wasabi':
        return this.wasabiDriver;
      case 'azure':
        return this.azureDriver;
      case 'local':
      default:
        return this.localDriver;
    }
  }

  async uploadPhoto(
    file: { buffer: Buffer; filename: string; mimetype: string; size: number },
    isPublic = false,
  ): Promise<FileResponseDto> {
    this.validateFile(file);

    const filename = this.generateFilename(file.filename);
    const uploadResult = await this.driver.upload(file.buffer, filename, file.mimetype);

    const fileRecord = await this.prismaService.prisma.file.create({
      data: {
        filename,
        originalName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        driver: this.storageDriver,
        path: uploadResult.path,
        url: uploadResult.url ?? null,
        isPublic,
      },
    });

    this.logger.log(`File uploaded successfully: ${filename}`);
    return this.mapToResponseDto(fileRecord);
  }

  async uploadMultiplePhotos(
    files: Array<{ buffer: Buffer; filename: string; mimetype: string; size: number }>,
    isPublic = false,
  ): Promise<FileResponseDto[]> {
    const uploadedFiles: FileResponseDto[] = [];

    for (const file of files) {
      try {
        const uploaded = await this.uploadPhoto(file, isPublic);
        uploadedFiles.push(uploaded);
      } catch (error: unknown) {
        this.logger.error(`Failed to upload file: ${file.filename}`, error);
      }
    }

    return uploadedFiles;
  }

  async getFile(id: number): Promise<FileResponseDto> {
    const file = await this.prismaService.prisma.file.findUnique({
      where: { id },
    });

    if (!file || file.deletedAt) {
      throw new BadRequestException('File not found');
    }

    return this.mapToResponseDto(file);
  }

  async deleteFile(id: number): Promise<{ message: string }> {
    const file = await this.prismaService.prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new BadRequestException('File not found');
    }

    await this.driver.delete(file.filename);

    await this.prismaService.prisma.file.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    this.logger.log(`File soft deleted: ${file.filename}`);
    return { message: 'File deleted successfully' };
  }

  async cleanupOrphanedFiles(): Promise<{ deletedCount: number; message: string }> {
    const retentionDays = this.configService.get<number>('ORPHANED_FILES_RETENTION_DAYS') ?? 30;
    const cutoffDate = dayjs().subtract(retentionDays, 'days').toDate();

    const orphanedFiles = await this.prismaService.prisma.file.findMany({
      where: {
        deletedAt: {
          lt: cutoffDate,
        },
      },
    });

    let deletedCount = 0;

    for (const file of orphanedFiles) {
      try {
        await this.driver.delete(file.filename);
        await this.prismaService.prisma.file.delete({
          where: { id: file.id },
        });
        deletedCount++;
      } catch (error) {
        this.logger.error(`Failed to cleanup file: ${file.filename}`, error);
      }
    }

    this.logger.log(`Cleanup completed: ${deletedCount} files deleted`);
    return {
      deletedCount,
      message: `Successfully deleted ${deletedCount} orphaned files older than ${retentionDays} days`,
    };
  }

  private validateFile(file: {
    buffer: Buffer;
    filename: string;
    mimetype: string;
    size: number;
  }): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > this.maxFileSizeMB) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSizeMB}MB`,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }
  }

  async listFiles(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    files: FileResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
      this.prismaService.prisma.file.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prismaService.prisma.file.count({
        where: { deletedAt: null },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      files: files.map(file => this.mapToResponseDto(file)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  private generateFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const filename = `${randomUUID()}${ext}`;
    return filename;
  }

  private mapToResponseDto(file: Record<string, unknown>): FileResponseDto {
    return {
      id: Number(file.id),
      filename: String(file.filename),
      originalName: String(file.originalName),
      mimeType: String(file.mimeType),
      size: Number(file.size),
      driver: String(file.driver),
      url: typeof file.url === 'string' ? file.url : '',
      isPublic: Boolean(file.isPublic),
      createdAt: file.createdAt as Date,
      updatedAt: file.updatedAt as Date,
    };
  }
}
