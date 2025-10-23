import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';

import { QueryUserDto } from './dto/query-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserService } from './user.service';

import { CurrentUser, CurrentUserType } from '@/src/common/decorators/current-user.decorator';

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
}
