import * as path from 'path';

import { Module } from '@nestjs/common';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule as NestI18nModule,
  QueryResolver,
} from 'nestjs-i18n';

/**
 * Core i18n configuration module
 * This sets up the translation system and provides the i18n service
 */
@Module({
  imports: [
    NestI18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '../../i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] }, // ?lang=en
        AcceptLanguageResolver, // Accept-Language header
        new HeaderResolver(['x-custom-lang']), // Custom header: x-custom-lang
      ],
    }),
  ],
})
export class I18nConfigModule {}
