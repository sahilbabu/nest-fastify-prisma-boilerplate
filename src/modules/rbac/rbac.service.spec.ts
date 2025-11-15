import { Test, TestingModule } from '@nestjs/testing';
import { RbacService } from './rbac.service';
import { UserRole } from './enums/user-role.enum';

describe('RbacService', () => {
  let service: RbacService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RbacService],
    }).compile();

    service = module.get<RbacService>(RbacService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hasRole', () => {
    it('should return true when user has exact role', () => {
      expect(service.hasRole(UserRole.ADMINISTRATOR, UserRole.ADMINISTRATOR)).toBe(true);
    });

    it('should return false when user does not have exact role', () => {
      expect(service.hasRole(UserRole.STAFF, UserRole.ADMINISTRATOR)).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true when user has one of the required roles', () => {
      const requiredRoles = [UserRole.MANAGER, UserRole.ADMINISTRATOR];
      expect(service.hasAnyRole(UserRole.ADMINISTRATOR, requiredRoles)).toBe(true);
    });

    it('should return false when user does not have any of the required roles', () => {
      const requiredRoles = [UserRole.MANAGER, UserRole.ADMINISTRATOR];
      expect(service.hasAnyRole(UserRole.STAFF, requiredRoles)).toBe(false);
    });
  });

  describe('hasMinRole', () => {
    it('should return true when user has higher role than minimum', () => {
      expect(service.hasMinRole(UserRole.ADMINISTRATOR, UserRole.STAFF)).toBe(true);
    });

    it('should return true when user has exact minimum role', () => {
      expect(service.hasMinRole(UserRole.STAFF, UserRole.STAFF)).toBe(true);
    });

    it('should return false when user has lower role than minimum', () => {
      expect(service.hasMinRole(UserRole.CUSTOMER, UserRole.STAFF)).toBe(false);
    });
  });

  describe('getRoleLevel', () => {
    it('should return correct level for each role', () => {
      expect(service.getRoleLevel(UserRole.OWNER)).toBe(7);
      expect(service.getRoleLevel(UserRole.ADMINISTRATOR)).toBe(6);
      expect(service.getRoleLevel(UserRole.MANAGER)).toBe(5);
      expect(service.getRoleLevel(UserRole.STAFF)).toBe(4);
      expect(service.getRoleLevel(UserRole.USER)).toBe(3);
      expect(service.getRoleLevel(UserRole.CUSTOMER)).toBe(2);
      expect(service.getRoleLevel(UserRole.SUBSCRIBER)).toBe(1);
    });
  });

  describe('isAdminOrAbove', () => {
    it('should return true for administrator', () => {
      expect(service.isAdminOrAbove(UserRole.ADMINISTRATOR)).toBe(true);
    });

    it('should return true for owner', () => {
      expect(service.isAdminOrAbove(UserRole.OWNER)).toBe(true);
    });

    it('should return false for manager', () => {
      expect(service.isAdminOrAbove(UserRole.MANAGER)).toBe(false);
    });
  });

  describe('isOwner', () => {
    it('should return true for owner', () => {
      expect(service.isOwner(UserRole.OWNER)).toBe(true);
    });

    it('should return false for administrator', () => {
      expect(service.isOwner(UserRole.ADMINISTRATOR)).toBe(false);
    });
  });

  describe('getRolesAtOrBelow', () => {
    it('should return all roles at or below manager level', () => {
      const roles = service.getRolesAtOrBelow(UserRole.MANAGER);
      expect(roles).toContain(UserRole.MANAGER);
      expect(roles).toContain(UserRole.STAFF);
      expect(roles).toContain(UserRole.USER);
      expect(roles).toContain(UserRole.CUSTOMER);
      expect(roles).toContain(UserRole.SUBSCRIBER);
      expect(roles).not.toContain(UserRole.ADMINISTRATOR);
      expect(roles).not.toContain(UserRole.OWNER);
    });
  });

  describe('getRolesAbove', () => {
    it('should return all roles above manager level', () => {
      const roles = service.getRolesAbove(UserRole.MANAGER);
      expect(roles).toContain(UserRole.ADMINISTRATOR);
      expect(roles).toContain(UserRole.OWNER);
      expect(roles).not.toContain(UserRole.MANAGER);
      expect(roles).not.toContain(UserRole.STAFF);
    });
  });
});
