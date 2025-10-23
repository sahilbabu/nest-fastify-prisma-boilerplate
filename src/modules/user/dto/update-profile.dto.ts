import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  ValidateIf,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'User email address',
    example: 'newemail@example.com',
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Username',
    example: 'new_username',
  })
  @IsOptional()
  @IsString()
  username: string;

  @ApiPropertyOptional({
    description: 'Current password (required if changing password)',
    example: 'OldPassword123',
  })
  @ValidateIf(o => o.newPassword)
  @IsOptional()
  @IsString()
  oldPassword: string;

  @ApiPropertyOptional({
    description: 'New password',
    example: 'NewPassword123',
  })
  @ValidateIf(o => o.oldPassword)
  @IsOptional()
  @IsStrongPassword()
  @IsString()
  newPassword: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsPhoneNumber()
  @IsString()
  phone: string;

  @ApiPropertyOptional({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  avatar: string;
}
