import { Injectable } from '@nestjs/common';
import { UserRole, ROLE_HIERARCHY } from './enums/user-role.enum';

@Injectable()
export class RbacService {
  /**
   * Check if user has specific role
   */
  hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
    return userRole === requiredRole;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
    return requiredRoles.includes(userRole);
  }

  /**
   * Check if user has minimum role level (hierarchical check)
   */
  hasMinRole(userRole: UserRole, minRole: UserRole): boolean {
    const userLevel = ROLE_HIERARCHY[userRole];
    const minLevel = ROLE_HIERARCHY[minRole];
    return userLevel >= minLevel;
  }

  /**
   * Get role hierarchy level
   */
  getRoleLevel(role: UserRole): number {
    return ROLE_HIERARCHY[role];
  }

  /**
   * Check if role is admin or above
   */
  isAdminOrAbove(role: UserRole): boolean {
    return this.hasMinRole(role, UserRole.ADMINISTRATOR);
  }

  /**
   * Check if role is owner
   */
  isOwner(role: UserRole): boolean {
    return role === UserRole.OWNER;
  }

  /**
   * Get all roles at or below the specified role level
   */
  getRolesAtOrBelow(role: UserRole): UserRole[] {
    const level = ROLE_HIERARCHY[role];
    return Object.entries(ROLE_HIERARCHY)
      .filter(([, roleLevel]) => roleLevel <= level)
      .map(([roleName]) => roleName as UserRole);
  }

  /**
   * Get all roles above the specified role level
   */
  getRolesAbove(role: UserRole): UserRole[] {
    const level = ROLE_HIERARCHY[role];
    return Object.entries(ROLE_HIERARCHY)
      .filter(([, roleLevel]) => roleLevel > level)
      .map(([roleName]) => roleName as UserRole);
  }
}
