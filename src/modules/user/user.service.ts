import { BadRequestException, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { QueryUserDto } from './dto/query-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

import { CurrentUserType } from '@/src/common/decorators/current-user.decorator';
import { Hashing } from '@/src/common/utils/hashing.util';
import { PrismaService } from '@/src/core/prisma/prisma.service';

@Injectable()
export class UserService {
  private readonly prismaService: PrismaService;
  private readonly i18n: I18nService;

  constructor(
    prismaService: PrismaService,
    i18n: I18nService,
  ) {
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
}
