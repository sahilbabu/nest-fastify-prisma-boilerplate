import { BlobServiceClient } from '@azure/storage-blob';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IStorageDriver } from './storage-driver.interface';

@Injectable()
export class AzureStorageDriver implements IStorageDriver {
  private readonly logger = new Logger(AzureStorageDriver.name);
  private readonly blobServiceClient: BlobServiceClient | null;
  private readonly containerName: string;
  private readonly isConfigured: boolean;

  constructor(private readonly configService: ConfigService) {
    const accountName = this.configService.get<string>('AZURE_STORAGE_ACCOUNT');
    const accountKey = this.configService.get<string>('AZURE_STORAGE_KEY');
    this.containerName = this.configService.get<string>('AZURE_CONTAINER_NAME') ?? '';

    this.isConfigured = !!(accountName && accountKey);

    if (this.isConfigured) {
      const connectionString = `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`;
      this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    } else {
      this.blobServiceClient = null;
      this.logger.warn('Azure Storage credentials not configured. Driver will not work.');
    }
  }

  async upload(file: Buffer, filename: string, mimeType: string): Promise<{ path: string; url: string }> {
    if (!this.isConfigured || !this.blobServiceClient) {
      throw new Error('Azure Storage is not configured');
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(filename);

      await blockBlobClient.upload(file, file.length, {
        blobHTTPHeaders: { blobContentType: mimeType },
      });

      this.logger.log(`File uploaded to Azure: ${filename}`);

      return {
        path: filename,
        url: blockBlobClient.url,
      };
    } catch (error: unknown) {
      this.logger.error(`Failed to upload file to Azure: ${filename}`, error);
      throw error;
    }
  }

  async delete(filename: string): Promise<void> {
    if (!this.isConfigured || !this.blobServiceClient) {
      throw new Error('Azure Storage is not configured');
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(filename);

      await blockBlobClient.delete();
      this.logger.log(`File deleted from Azure: ${filename}`);
    } catch (error: unknown) {
      this.logger.error(`Failed to delete file from Azure: ${filename}`, error);
      throw error;
    }
  }

  async getUrl(filename: string, isPublic = true): Promise<string> {
    if (!this.isConfigured || !this.blobServiceClient) {
      throw new Error('Azure Storage is not configured');
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(filename);

      return blockBlobClient.url;
    } catch (error: unknown) {
      this.logger.error(`Failed to get URL for file: ${filename}`, error);
      throw error;
    }
  }

  async exists(filename: string): Promise<boolean> {
    if (!this.isConfigured || !this.blobServiceClient) {
      return false;
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(filename);

      return await blockBlobClient.exists();
    } catch {
      return false;
    }
  }
}
