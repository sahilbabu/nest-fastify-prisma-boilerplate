import { join } from 'path';

import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { ApplicationConfiguration } from '../config/config.schema';

export const createMailerConfig = (config: ApplicationConfiguration): MailerOptions => {
  // Optimized for Mailtrap development and production email services
  // Default configuration is set for Mailtrap sandbox

  return {
    transport: {
      host: config.MAIL_HOST ?? 'sandbox.smtp.mailtrap.io',
      port: config.MAIL_PORT ?? 2525, // Default to Mailtrap port
      secure: config.MAIL_SECURE ?? false, // false for most development services
      auth: config.MAIL_USER && config.MAIL_PASS ? {
        user: config.MAIL_USER,
        pass: config.MAIL_PASS,
      } : undefined,
      // Additional debugging for development
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development',
    },
    defaults: {
      from: `"${config.MAIL_FROM_NAME}" <${config.MAIL_FROM_EMAIL ?? 'noreply@example.com'}>`,
    },
    template: {
      dir: join(__dirname, 'templates'),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  };
};
