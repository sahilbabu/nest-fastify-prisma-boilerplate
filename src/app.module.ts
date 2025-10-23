import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { ConfigModule } from './core/config/config.module';
import { I18nConfigModule } from './core/i18n/i18n.module';
import { LoggerModule } from './core/logger/logger.module';
import { MailModule } from './core/mail/mail.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { StorageModule } from './modules/storage/storage.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    // Core modules
    ConfigModule,
    PrismaModule,
    LoggerModule,
    I18nConfigModule,
    MailModule,

    // Feature modules
    UserModule,
    AuthModule,
    StorageModule,

    // Common utilities
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
