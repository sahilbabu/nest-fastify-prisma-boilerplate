import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IStorageDriver } from './storage-driver.interface';

@Injectable()
export class WasabiStorageDriver implements IStorageDriver {
  private readonly logger = new Logger(WasabiStorageDriver.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('WASABI_REGION') ?? 'us-east-1';
    this.endpoint = this.configService.get<string>('WASABI_ENDPOINT') ?? 'https://s3.wasabisys.com';
    this.bucket = this.configService.get<string>('WASABI_BUCKET') ?? '';

    this.s3Client = new S3Client({
      region,
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.configService.get<string>('WASABI_ACCESS_KEY_ID') ?? '',
        secretAccessKey: this.configService.get<string>('WASABI_SECRET_ACCESS_KEY') ?? '',
      },
    });
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
      this.logger.log(`File uploaded to Wasabi: ${filename}`);

      return {
        path: filename,
        url: `${this.endpoint}/${this.bucket}/${filename}`,
      };
    } catch (error: unknown) {
      this.logger.error(`Failed to upload file to Wasabi: ${filename}`, error);
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
      this.logger.log(`File deleted from Wasabi: ${filename}`);
    } catch (error: unknown) {
      this.logger.error(`Failed to delete file from Wasabi: ${filename}`, error);
      throw error;
    }
  }

  async getUrl(filename: string, isPublic = true): Promise<string> {
    try {
      if (isPublic) {
        return `${this.endpoint}/${this.bucket}/${filename}`;
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
