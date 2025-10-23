import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UploadPhotoDto {
  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Whether the file is public or private', default: false })
  isPublic?: boolean;
}
