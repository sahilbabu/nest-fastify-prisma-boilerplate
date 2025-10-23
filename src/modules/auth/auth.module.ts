import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy, RefreshTokenStrategy } from './strategies/jwt.strategy';

import { JwtAuthGuard } from '@/src/common/guards/jwt-auth.guard';
import { ConfigModule } from '@/src/core/config/config.module';
import { config } from '@/src/core/config/config.schema';
import { MailModule } from '@/src/core/mail/mail.module';
import { UserModule } from '@/src/modules/user/user.module';

@Module({
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  imports: [
    PassportModule,
    UserModule,
    ConfigModule,
    MailModule,
    JwtModule.register({
      secret: config.JWT_SECRET_KEY,
      signOptions: { expiresIn: config.JWT_REFRESH_TOKEN_EXPIRES_IN } as JwtSignOptions,
    }),
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
