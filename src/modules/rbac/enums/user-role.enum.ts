export enum UserRole {
  OWNER = 'OWNER',
  ADMINISTRATOR = 'ADMINISTRATOR',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  USER = 'USER',
  CUSTOMER = 'CUSTOMER',
  SUBSCRIBER = 'SUBSCRIBER',
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.OWNER]: 7,
  [UserRole.ADMINISTRATOR]: 6,
  [UserRole.MANAGER]: 5,
  [UserRole.STAFF]: 4,
  [UserRole.USER]: 3,
  [UserRole.CUSTOMER]: 2,
  [UserRole.SUBSCRIBER]: 1,
};
