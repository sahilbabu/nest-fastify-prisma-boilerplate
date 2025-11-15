import { Body, Controller, Get, Param, Patch, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';

import { QueryUserDto } from './dto/query-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserService } from './user.service';

import { CurrentUser, CurrentUserType } from '@/src/common/decorators/current-user.decorator';
import { MinRole } from '@/src/modules/rbac/decorators/min-role.decorator';
import { UpdateUserRoleDto } from '@/src/modules/rbac/dto/update-user-role.dto';
import { UserRole } from '@/src/modules/rbac/enums/user-role.enum';
import { MinRoleGuard } from '@/src/modules/rbac/guards/min-role.guard';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UserController {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  findAll(@Query() query: QueryUserDto): Promise<unknown> {
    return this.userService.findAll(query);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'lang', required: false, description: 'Language code (en, es, fr)' })
  findProfile(
    @CurrentUser() user: CurrentUserType,
    @I18n() i18n: I18nContext,
  ): Record<string, unknown> {
    const profile = this.userService.findProfile(user);
    return {
      ...profile,
      message: i18n.t('user.profile.updated'), // Example using @I18n() decorator
    };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Return updated profile' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser() user: CurrentUserType,
  ): Promise<{ message: string; user: unknown }> {
    // This method uses I18nService injection internally
    return this.userService.updateProfile(user, updateProfileDto);
  }

  @Put(':id/role')
  @UseGuards(MinRoleGuard)
  @MinRole(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserRole(
    @Param('id') userId: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<{ message: string; user: unknown }> {
    return this.userService.updateUserRole(parseInt(userId), updateUserRoleDto.role, currentUser);
  }
}
