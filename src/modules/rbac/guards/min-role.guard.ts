import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MIN_ROLE_KEY } from '../decorators/min-role.decorator';
import { UserRole, ROLE_HIERARCHY } from '../enums/user-role.enum';

@Injectable()
export class MinRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredMinRole = this.reflector.getAllAndOverride<UserRole>(MIN_ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredMinRole) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userRoleLevel = ROLE_HIERARCHY[user.role as UserRole];
    const requiredRoleLevel = ROLE_HIERARCHY[requiredMinRole];

    if (userRoleLevel < requiredRoleLevel) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
