import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { PrismaService } from '@/src/core/prisma/prisma.service';
import { User } from '@/src/generated/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET_KEY') ?? '',
    });
  }
  async validate(payload: any): Promise<User> {
    const user = await this.prismaService.prisma.user.findUnique({
      cacheStrategy: {
        ttl: 60, // Cache for 1 minute
      },
      where: { id: payload?.id },
      omit: { password: false },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    if (!user.isActive) {
      throw new UnauthorizedException('User blocked');
    }
    return user;
  }
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET_KEY') ?? '',
    });
  }

  async validate(payload: any): Promise<User> {
    const user = await this.prismaService.prisma.user.findUnique({
      where: { id: payload?.id },
      omit: { password: false },
    });

    if (!user?.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User blocked');
    }

    if (user.refreshTokenExp && new Date() > user.refreshTokenExp) {
      throw new UnauthorizedException('Refresh token expired');
    }

    return user;
  }
}
