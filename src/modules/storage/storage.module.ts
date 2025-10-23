import { Module } from '@nestjs/common';

import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { LocalStorageDriver } from './drivers/local-storage.driver';
import { S3StorageDriver } from './drivers/s3-storage.driver';
import { WasabiStorageDriver } from './drivers/wasabi-storage.driver';
import { AzureStorageDriver } from './drivers/azure-storage.driver';

import { PrismaModule } from '@/src/core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StorageController],
  providers: [
    StorageService,
    {
      provide: LocalStorageDriver,
      useClass: LocalStorageDriver,
    },
    {
      provide: S3StorageDriver,
      useClass: S3StorageDriver,
    },
    {
      provide: WasabiStorageDriver,
      useClass: WasabiStorageDriver,
    },
    {
      provide: AzureStorageDriver,
      useClass: AzureStorageDriver,
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
