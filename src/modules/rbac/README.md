# Role-Based Access Control (RBAC) Module

A simple and clean RBAC implementation for NestJS with predefined roles and
hierarchical permissions.

## Features

- **Predefined Roles**: Owner, Administrator, Manager, Staff, User, Customer,
  Subscriber
- **Role Hierarchy**: Higher roles inherit permissions from lower roles
- **Simple Guards**: Easy-to-use decorators for role-based authorization
- **Role Management**: Admin endpoints for managing user roles
- **Type Safety**: Full TypeScript support with enums and types

## Roles & Hierarchy

The system uses a hierarchical role structure where higher roles have more
permissions:

```
OWNER (Level 7)           - Highest level, can do everything
├── ADMINISTRATOR (Level 6) - Can manage all users except owners
├── MANAGER (Level 5)       - Can manage staff and customers
├── STAFF (Level 4)         - Can perform staff operations
├── USER (Level 3)          - Regular user access
├── CUSTOMER (Level 2)      - Customer access
└── SUBSCRIBER (Level 1)    - Basic access level
```

## Usage

### 1. Using Role Guards

#### Specific Roles Only

```typescript
import { UseGuards } from '@nestjs/common';
import { Roles, RolesGuard, UserRole } from '@/src/modules/rbac';

@Get('admin-only')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMINISTRATOR)
async getAdminData() {
  return { message: 'Admin only data' };
}

@Get('multi-role')
@UseGuards(RolesGuard)
@Roles(UserRole.MANAGER, UserRole.ADMINISTRATOR, UserRole.OWNER)
async getMultiRoleData() {
  return { message: 'Manager, Admin, or Owner only' };
}
```

#### Minimum Role Level (Hierarchical)

```typescript
import { UseGuards } from '@nestjs/common';
import { MinRole, MinRoleGuard, UserRole } from '@/src/modules/rbac';

@Get('staff-and-above')
@UseGuards(MinRoleGuard)
@MinRole(UserRole.STAFF)
async getStaffData() {
  return { message: 'Staff, Manager, Admin, or Owner can access' };
}
```

### 2. Using RBAC Service

```typescript
import { RbacService, UserRole } from '@/src/modules/rbac';

@Injectable()
export class YourService {
  constructor(private rbacService: RbacService) {}

  checkPermissions(userRole: UserRole) {
    // Check specific role
    const isAdmin = this.rbacService.hasRole(userRole, UserRole.ADMINISTRATOR);

    // Check multiple roles
    const hasAccess = this.rbacService.hasAnyRole(userRole, [
      UserRole.MANAGER,
      UserRole.ADMINISTRATOR,
    ]);

    // Check minimum role level
    const canManage = this.rbacService.hasMinRole(userRole, UserRole.STAFF);

    // Helper methods
    const isAdminOrAbove = this.rbacService.isAdminOrAbove(userRole);
    const isOwner = this.rbacService.isOwner(userRole);

    // Get role information
    const roleLevel = this.rbacService.getRoleLevel(userRole);
    const subordinateRoles = this.rbacService.getRolesAtOrBelow(userRole);
    const superiorRoles = this.rbacService.getRolesAbove(userRole);
  }
}
```

### 3. Managing User Roles (Admin Only)

Update a user's role (requires ADMINISTRATOR level or above):

```bash
PUT /users/:id/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "STAFF"
}
```

## API Endpoints

### User Management

- `PUT /users/:id/role` - Update user role (Admin only)

## Database Schema

The RBAC module adds a `role` field to the User model:

```prisma
enum UserRole {
  OWNER
  ADMINISTRATOR
  MANAGER
  STAFF
  USER
  CUSTOMER
  SUBSCRIBER
}

model User {
  // ... other fields
  role UserRole @default(CUSTOMER)
}
```

## Seeded Test Users

The following test users are created during database seeding:

| Username   | Email                  | Password  | Role          |
| ---------- | ---------------------- | --------- | ------------- |
| owner      | owner@example.com      | #Pass1234 | OWNER         |
| admin      | admin@example.com      | #Pass1234 | ADMINISTRATOR |
| manager    | manager@example.com    | #Pass1234 | MANAGER       |
| staff      | staff@example.com      | #Pass1234 | STAFF         |
| user       | user@example.com       | #Pass1234 | USER          |
| customer   | customer@example.com   | #Pass1234 | CUSTOMER      |
| subscriber | subscriber@example.com | #Pass1234 | SUBSCRIBER    |

## Security Considerations

1. **Owner Protection**: Only owners can modify owner roles
2. **Hierarchy Enforcement**: Users cannot assign roles higher than their own
3. **Role Validation**: All role assignments are validated against the enum
4. **Authentication Required**: All protected endpoints require valid JWT tokens

## Architecture

```
src/modules/rbac/
├── decorators/
│   ├── roles.decorator.ts        # @Roles() decorator for specific roles
│   └── min-role.decorator.ts     # @MinRole() decorator for minimum level
├── dto/
│   └── update-user-role.dto.ts   # DTO for role updates
├── enums/
│   └── user-role.enum.ts         # Role enum and hierarchy
├── guards/
│   ├── roles.guard.ts            # Guard for specific roles
│   └── min-role.guard.ts         # Guard for minimum role level
├── rbac.controller.ts            # Demo endpoints
├── rbac.service.ts               # RBAC business logic
├── rbac.module.ts                # Module definition
└── index.ts                      # Exports
```

## Examples

### Protecting a Controller Method

```typescript
@Controller('products')
export class ProductsController {
  @Get()
  @Public() // Anyone can view products
  async findAll() {
    return this.productsService.findAll();
  }

  @Post()
  @UseGuards(MinRoleGuard)
  @MinRole(UserRole.STAFF) // Staff and above can create
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Delete(':id')
  @UseGuards(MinRoleGuard)
  @MinRole(UserRole.MANAGER) // Manager and above can delete
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
```

### Business Logic with Role Checks

```typescript
@Injectable()
export class OrderService {
  constructor(private rbacService: RbacService) {}

  async getOrders(user: CurrentUserType) {
    const userRole = user.role as UserRole;

    if (this.rbacService.isAdminOrAbove(userRole)) {
      // Admins can see all orders
      return this.findAll();
    } else if (this.rbacService.hasMinRole(userRole, UserRole.STAFF)) {
      // Staff can see orders in their department
      return this.findByDepartment(user.departmentId);
    } else {
      // Customers can only see their own orders
      return this.findByUserId(user.id);
    }
  }
}
```

## Integration with Existing Auth

The RBAC module integrates seamlessly with the existing JWT authentication
system. The role information is included in the JWT payload and available
through the `@CurrentUser()` decorator.

## Best Practices

1. **Use MinRole for Hierarchical Permissions**: When you want higher roles to
   inherit permissions
2. **Use Roles for Specific Access**: When only certain roles should have access
3. **Combine with Business Logic**: Use the RbacService in your services for
   complex permission logic
4. **Validate Role Changes**: Always validate role assignments in your business
   logic
5. **Audit Role Changes**: Consider logging role changes for security auditing
