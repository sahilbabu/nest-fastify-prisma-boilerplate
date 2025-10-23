import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'admin@example.com',
    required: false,
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @ValidateIf((o) => !o.username)
  email: string;

  @ApiProperty({
    description: 'Username',
    example: 'admin',
    required: false,
  })
  @IsString()
  @ValidateIf((o) => !o.email)
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'User password',
    example: '#Pass1234',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
