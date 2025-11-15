import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { QueryUserDto } from './dto/query-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

import { CurrentUserType } from '@/src/common/decorators/current-user.decorator';
import { Hashing } from '@/src/common/utils/hashing.util';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { UserRole, ROLE_HIERARCHY } from '@/src/modules/rbac/enums/user-role.enum';

@Injectable()
export class UserService {
  private readonly prismaService: PrismaService;
  private readonly i18n: I18nService;

  constructor(prismaService: PrismaService, i18n: I18nService) {
    this.prismaService = prismaService;
    this.i18n = i18n;
  }

  async findAll(query: QueryUserDto): Promise<unknown[]> {
    return await this.prismaService.prisma.user.findMany({
      skip: (query.offset - 1) * query.limit,
      take: query.limit,
    });
  }

  findProfile(user: CurrentUserType): Omit<CurrentUserType, 'password'> {
    const { password: _password, ...data } = user;
    return data;
  }

  async updateProfile(
    user: CurrentUserType,
    updateProfileDto: UpdateProfileDto,
  ): Promise<{ message: string; user: unknown }> {
    const { oldPassword, newPassword, ...rest } = updateProfileDto;
    const userExist = await this.prismaService.prisma.user.findFirst({
      where: {
        OR: [{ email: updateProfileDto.email }, { username: updateProfileDto.username }],
      },
    });
    if (userExist && userExist.id !== user.id) {
      // Example of using I18nService injection for error messages
      const errorMessage = this.i18n.t('user.errors.emailOrUsernameExists');
      throw new BadRequestException(errorMessage);
    }

    const data: Partial<typeof rest & { password?: string }> = { ...rest };
    if (oldPassword && newPassword) {
      await Hashing.compareOrFail(oldPassword, user.password, 'password is not correct');
      const hashedPassword = await Hashing.hash(newPassword);
      data.password = hashedPassword;
    }

    const updatedUser = await this.prismaService.prisma.user.update({
      where: { id: user.id },
      data: { ...data },
    });

    // Example of using I18nService injection for success messages
    const successMessage = this.i18n.t('user.profile.updated');

    return {
      message: successMessage,
      user: updatedUser,
    };
  }

  async updateUserRole(
    userId: number,
    newRole: UserRole,
    currentUser: CurrentUserType,
  ): Promise<{ message: string; user: unknown }> {
    // Check if the target user exists
    const targetUser = await this.prismaService.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Prevent owners from being demoted (only owners can change owner roles)
    if (targetUser.role === UserRole.OWNER && currentUser.role !== UserRole.OWNER) {
      throw new ForbiddenException('Only owners can modify owner roles');
    }

    // Prevent users from assigning roles higher than their own
    const currentUserLevel = ROLE_HIERARCHY[currentUser.role as UserRole];
    const newRoleLevel = ROLE_HIERARCHY[newRole];

    if (newRoleLevel >= currentUserLevel && currentUser.role !== UserRole.OWNER) {
      throw new ForbiddenException('Cannot assign a role equal to or higher than your own');
    }

    // Update the user's role
    const updatedUser = await this.prismaService.prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    const successMessage = this.i18n.t('user.role.updated');

    return {
      message: successMessage,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
      },
    };
  }
}
