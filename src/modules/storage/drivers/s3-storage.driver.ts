import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IStorageDriver } from './storage-driver.interface';

@Injectable()
export class S3StorageDriver implements IStorageDriver {
  private readonly logger = new Logger(S3StorageDriver.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION') ?? 'us-east-1';
    this.s3Client = new S3Client({ region });
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET') ?? '';
  }

  async upload(file: Buffer, filename: string, mimeType: string): Promise<{ path: string; url: string }> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: filename,
        Body: file,
        ContentType: mimeType,
      });

      await this.s3Client.send(command);
      this.logger.log(`File uploaded to S3: ${filename}`);

      return {
        path: filename,
        url: `https://${this.bucket}.s3.amazonaws.com/${filename}`,
      };
    } catch (error: unknown) {
      this.logger.error(`Failed to upload file to S3: ${filename}`, error);
      throw error;
    }
  }

  async delete(filename: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: filename,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted from S3: ${filename}`);
    } catch (error: unknown) {
      this.logger.error(`Failed to delete file from S3: ${filename}`, error);
      throw error;
    }
  }

  async getUrl(filename: string, isPublic = true): Promise<string> {
    try {
      if (isPublic) {
        return `https://${this.bucket}.s3.amazonaws.com/${filename}`;
      }

      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: filename,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
      return signedUrl;
    } catch (error: unknown) {
      this.logger.error(`Failed to get URL for file: ${filename}`, error);
      throw error;
    }
  }

  async exists(filename: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: filename,
      });

      await this.s3Client.send(command);
      return true;
    } catch {
      return false;
    }
  }
}
