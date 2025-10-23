import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

import { ApplicationConfiguration } from '../config/config.schema';

import { createMailerConfig } from './mail.config';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<ApplicationConfiguration>) => {
        const config = {
          MAIL_HOST: configService.get('MAIL_HOST'),
          MAIL_PORT: parseInt(configService.get('MAIL_PORT') ?? '2525', 10),
          MAIL_USER: configService.get('MAIL_USER'),
          MAIL_PASS: configService.get('MAIL_PASS'),
          MAIL_FROM_NAME: configService.get('MAIL_FROM_NAME'),
          MAIL_FROM_EMAIL: configService.get('MAIL_FROM_EMAIL'),
          MAIL_SECURE: configService.get('MAIL_SECURE') === 'true',
        } as ApplicationConfiguration;

        return createMailerConfig(config);
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
