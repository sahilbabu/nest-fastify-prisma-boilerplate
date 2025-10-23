import { BadRequestException, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';

import { FileResponseDto } from './dto/file-response.dto';
import { ListFilesDto } from './dto/list-files.dto';
import { StorageService } from './storage.service';

import { Public } from '@/src/common/decorators/public.decorator';
import { JwtAuthGuard } from '@/src/common/guards/jwt-auth.guard';

@ApiTags('Storage')
@Controller('files')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all files with pagination' })
  @ApiResponse({ status: 200, description: 'Return paginated list of files' })
  async listFiles(@Query() query: ListFilesDto): Promise<{
    files: FileResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.storageService.listFiles(query.page, query.limit);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload a single photo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Photo file (JPEG, PNG, WebP, HEIC - max 8MB)',
        },
        isPublic: {
          type: 'boolean',
          description: 'Whether the file is publicly accessible',
          default: false,
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, type: FileResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file' })
  async uploadPhoto(@Req() request: FastifyRequest): Promise<FileResponseDto> {
    const data = await request.file();

    if (!data) {
      throw new BadRequestException('No file provided');
    }

    const chunks: Buffer[] = [];
    for await (const chunk of data.file) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const isPublic = (data.fields.isPublic as unknown as { value: string })?.value === 'true';

    return this.storageService.uploadPhoto(
      {
        buffer,
        filename: data.filename,
        mimetype: data.mimetype,
        size: buffer.length,
      },
      isPublic,
    );
  }

  @Post('upload-multiple')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload multiple photos' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Photo files (JPEG, PNG, WebP, HEIC - max 8MB each)',
        },
        isPublic: {
          type: 'boolean',
          description: 'Whether the files are publicly accessible',
          default: false,
        },
      },
      required: ['files'],
    },
  })
  @ApiResponse({ status: 201, type: [FileResponseDto] })
  async uploadMultiplePhotos(@Req() request: FastifyRequest): Promise<FileResponseDto[]> {
    const parts = request.parts();
    const files: Array<{ buffer: Buffer; filename: string; mimetype: string; size: number }> = [];
    let isPublic = false;

    for await (const part of parts) {
      if (part.type === 'file') {
        const chunks: Buffer[] = [];
        for await (const chunk of part.file) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        files.push({
          buffer,
          filename: part.filename,
          mimetype: part.mimetype,
          size: buffer.length,
        });
      } else if (part.fieldname === 'isPublic') {
        isPublic = (part.value as unknown as string) === 'true';
      }
    }

    return this.storageService.uploadMultiplePhotos(files, isPublic);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get file metadata' })
  @ApiResponse({ status: 200, type: FileResponseDto })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getFile(@Param('id', ParseIntPipe) id: number): Promise<FileResponseDto> {
    return this.storageService.getFile(id);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete file (soft delete)' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.storageService.deleteFile(id);
  }

  @Post('cleanup-orphaned')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cleanup orphaned files' })
  @ApiResponse({ status: 200, description: 'Cleanup completed' })
  async cleanupOrphanedFiles(): Promise<{ deletedCount: number; message: string }> {
    return this.storageService.cleanupOrphanedFiles();
  }
}
