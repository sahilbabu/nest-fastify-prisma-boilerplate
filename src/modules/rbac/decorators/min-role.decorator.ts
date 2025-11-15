import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';

export const MIN_ROLE_KEY = 'minRole';
export const MinRole = (role: UserRole) => SetMetadata(MIN_ROLE_KEY, role);
