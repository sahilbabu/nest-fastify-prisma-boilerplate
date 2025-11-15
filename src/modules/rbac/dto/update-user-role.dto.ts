import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { UserRole } from '../enums/user-role.enum';

export class UpdateUserRoleDto {
  @ApiProperty({
    enum: UserRole,
    description: 'New role to assign to the user',
    example: UserRole.STAFF,
  })
  @IsEnum(UserRole, { message: 'Role must be a valid UserRole' })
  @IsNotEmpty()
  role: UserRole;
}
