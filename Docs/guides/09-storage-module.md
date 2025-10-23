# Storage Module Guide

Complete guide for the production-ready storage module supporting multiple cloud providers.

## Overview

The storage module provides a unified interface for file uploads with support for:
- **Local** filesystem storage
- **Amazon S3**
- **Wasabi** (S3-compatible)
- **Azure Blob Storage**

## Installation

### 1. Install Dependencies

```bash
yarn add @fastify/multipart uuid
yarn add -D @types/uuid

# For S3/Wasabi support
yarn add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# For Azure support
yarn add @azure/storage-blob

# For Fastify file upload interceptor
yarn add @nest-lab/fastify-multer
```

### 2. Database Migration

Run Prisma migration to create the File table:

```bash
yarn prisma migrate dev --name add_file_model
```

## Configuration

### Environment Variables

Add to your `.env` file:

```env
# Storage driver selection
STORAGE_DRIVER=local # local | s3 | wasabi | azure

# Local Storage
LOCAL_STORAGE_PATH=./uploads

# File Limits
MAX_PHOTO_SIZE_MB=8
ALLOWED_PHOTO_TYPES=image/jpeg,image/png,image/webp,image/heic

# Cleanup
ORPHANED_FILES_RETENTION_DAYS=30
CLEANUP_SCHEDULE_CRON=0 2 * * *

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Wasabi
WASABI_ACCESS_KEY_ID=your_access_key
WASABI_SECRET_ACCESS_KEY=your_secret_key
WASABI_REGION=us-east-1
WASABI_BUCKET=your-bucket-name
WASABI_ENDPOINT=https://s3.wasabisys.com

# Azure
AZURE_STORAGE_ACCOUNT=your_account_name
AZURE_STORAGE_KEY=your_account_key
AZURE_CONTAINER_NAME=your-container-name
```

## Usage

### Upload Single Photo

```typescript
import { StorageService } from '@/modules/storage/storage.service';

@Post('upload')
async uploadPhoto(
  @UploadedFile() file: Express.Multer.File,
  @Body() dto: UploadPhotoDto,
) {
  return this.storageService.uploadPhoto(file, dto.isPublic);
}
```

### Upload Multiple Photos

```typescript
@Post('upload-multiple')
async uploadMultiple(
  @UploadedFiles() files: Express.Multer.File[],
  @Body() dto: UploadPhotoDto,
) {
  return this.storageService.uploadMultiplePhotos(files, dto.isPublic);
}
```

### List All Files (with Pagination)

```typescript
GET /api/v1/files?page=1&limit=10
Authorization: Bearer <token>
```

Query Parameters:
- `page`: Page number (default: 1, minimum: 1)
- `limit`: Items per page (default: 10, maximum: 100)

Response:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "files": [
      {
        "id": 1,
        "filename": "550e8400-e29b-41d4-a716-446655440000.jpg",
        "originalName": "photo.jpg",
        "mimeType": "image/jpeg",
        "size": 2048000,
        "driver": "local",
        "url": "/uploads/550e8400-e29b-41d4-a716-446655440000.jpg",
        "isPublic": true,
        "createdAt": "2024-10-22T15:30:00Z",
        "updatedAt": "2024-10-22T15:30:00Z"
      }
    ],
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  },
  "meta": {
    "timestamp": "2024-10-22T15:30:00+04:00",
    "path": "/api/v1/files",
    "version": "1.0"
  }
}
```

**Note:** Requires JWT authentication. Only returns non-deleted files, ordered by newest first.

### Get File Metadata

```typescript
GET /api/v1/files/:id
```

Response:
```json
{
  "id": 1,
  "filename": "550e8400-e29b-41d4-a716-446655440000.jpg",
  "originalName": "photo.jpg",
  "mimeType": "image/jpeg",
  "size": 2048000,
  "driver": "local",
  "url": "/uploads/550e8400-e29b-41d4-a716-446655440000.jpg",
  "isPublic": true,
  "createdAt": "2024-10-22T15:30:00Z",
  "updatedAt": "2024-10-22T15:30:00Z"
}
```

### Delete File (Soft Delete)

```typescript
DELETE /api/v1/files/:id
```

Files are soft-deleted and can be permanently removed via cleanup job.

### Cleanup Orphaned Files

Manual trigger (admin only):
```typescript
POST /api/v1/files/cleanup-orphaned
```

Response:
```json
{
  "deletedCount": 5,
  "message": "Successfully deleted 5 orphaned files older than 30 days"
}
```

## Driver Configuration

### Local Storage

Best for development and small deployments.

```env
STORAGE_DRIVER=local
LOCAL_STORAGE_PATH=./uploads
```

Files are stored in the specified directory. Ensure the directory is writable.

### AWS S3

For production deployments on AWS.

```env
STORAGE_DRIVER=s3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket
```

**Setup:**
1. Create S3 bucket
2. Create IAM user with S3 permissions
3. Generate access keys

### Wasabi

S3-compatible storage with lower costs.

```env
STORAGE_DRIVER=wasabi
WASABI_ACCESS_KEY_ID=your_key
WASABI_SECRET_ACCESS_KEY=your_secret
WASABI_REGION=us-east-1
WASABI_BUCKET=your-bucket
WASABI_ENDPOINT=https://s3.wasabisys.com
```

**Setup:**
1. Create Wasabi account
2. Create bucket
3. Generate API credentials

### Azure Blob Storage

For deployments on Azure cloud.

```env
STORAGE_DRIVER=azure
AZURE_STORAGE_ACCOUNT=your_account
AZURE_STORAGE_KEY=your_key
AZURE_CONTAINER_NAME=your-container
```

**Setup:**
1. Create Azure Storage Account
2. Create container
3. Get connection credentials

## File Validation

### Size Limits

- Maximum file size: **8MB** (configurable)
- Configured via `MAX_PHOTO_SIZE_MB`

### Allowed MIME Types

- `image/jpeg`
- `image/png`
- `image/webp`
- `image/heic`

Configure via `ALLOWED_PHOTO_TYPES` (comma-separated).

## API Endpoints

### List All Files (with Pagination)

```
GET /api/v1/files?page=1&limit=10
Authorization: Bearer <token>

Query Parameters:
- page: number (optional, default: 1, minimum: 1)
- limit: number (optional, default: 10, maximum: 100)

Response: { files: FileResponseDto[], total: number, page: number, limit: number, totalPages: number }
```

### Upload Single Photo

```
POST /api/v1/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Parameters:
- file: File (required)
- isPublic: boolean (optional, default: false)

Response: FileResponseDto
```

### Upload Multiple Photos

```
POST /api/v1/files/upload-multiple
Authorization: Bearer <token>
Content-Type: multipart/form-data

Parameters:
- files: File[] (required)
- isPublic: boolean (optional, default: false)

Response: FileResponseDto[]
```

### Get File Metadata

```
GET /api/v1/files/:id

Response: FileResponseDto
```

### Delete File

```
DELETE /api/v1/files/:id
Authorization: Bearer <token>

Response: { message: string }
```

### Cleanup Orphaned Files

```
POST /api/v1/files/cleanup-orphaned
Authorization: Bearer <admin_token>

Response: { deletedCount: number, message: string }
```

## File Metadata

Files are stored in the database with the following metadata:

```prisma
model File {
  id           Int      @id @default(autoincrement())
  filename     String   @unique          # UUID-based filename
  originalName String                    # Original uploaded filename
  mimeType     String                    # MIME type
  size         Int                       # File size in bytes
  driver       String                    # Storage driver used
  path         String                    # Storage path
  url          String?                   # Public/signed URL
  isPublic     Boolean  @default(false)  # Public access flag
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  deletedAt    DateTime?                 # Soft delete timestamp
}
```

## Cleanup Strategy

### Orphaned Files

Files marked as deleted (`deletedAt` is set) are kept for a retention period (default: 30 days) before permanent deletion.

### Automatic Cleanup

Configure cron schedule:
```env
CLEANUP_SCHEDULE_CRON=0 2 * * *  # Daily at 2 AM
```

### Manual Cleanup

Trigger manually via admin endpoint:
```bash
curl -X POST http://localhost:3000/api/v1/files/cleanup-orphaned \
  -H "Authorization: Bearer <admin_token>"
```

## Security Considerations

### File Naming

- Files are renamed using UUID v4 + original extension
- Original filename is preserved in metadata
- Prevents filename conflicts and directory traversal attacks

### Access Control

- Public files accessible via direct URL
- Private files require signed URLs (S3/Wasabi/Azure)
- Soft delete prevents accidental permanent loss

### Size Limits

- Enforced at upload time
- Prevents abuse and storage exhaustion
- Configurable per environment

## Switching Drivers

To switch storage drivers at runtime:

1. Update `STORAGE_DRIVER` environment variable
2. Restart application
3. Existing files remain accessible (metadata preserved)

**Note:** File URLs may change when switching drivers. Consider implementing URL redirects.

## Troubleshooting

### Local Storage Issues

- Ensure directory exists and is writable
- Check file permissions
- Verify `LOCAL_STORAGE_PATH` is correct

### S3/Wasabi Issues

- Verify AWS credentials
- Check bucket name and region
- Ensure IAM permissions include `s3:PutObject`, `s3:DeleteObject`
- Test connectivity to endpoint

### Azure Issues

- Verify storage account credentials
- Check container exists
- Ensure account key is correct
- Verify network connectivity

## Performance Tips

1. **Use CDN** for public files (CloudFront for S3, etc.)
2. **Enable compression** for text-based files
3. **Implement caching** headers for static content
4. **Monitor storage costs** especially for cloud providers
5. **Regular cleanup** of orphaned files

## Examples

### Upload and Get URL

```typescript
// Upload
const file = await this.storageService.uploadPhoto(uploadedFile, true);

// Get URL
const url = await this.storageService.getFile(file.id);
console.log(url.url); // Public URL
```

### List Files with Pagination

```typescript
const result = await this.storageService.listFiles(1, 10);
console.log(`Total files: ${result.total}`);
console.log(`Page ${result.page} of ${result.totalPages}`);
result.files.forEach(f => console.log(f.filename));
```

### Batch Upload

```typescript
const files = await this.storageService.uploadMultiplePhotos(uploadedFiles, false);
files.forEach(f => console.log(f.filename));
```

### Cleanup

```typescript
const result = await this.storageService.cleanupOrphanedFiles();
console.log(`Deleted ${result.deletedCount} files`);
```
