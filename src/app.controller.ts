import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';

import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@ApiTags('System')
@Controller()
@Public()
export class AppController {
  private readonly appService: AppService;

  constructor(appService: AppService) {
    this.appService = appService;
  }

  @Get('ping')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getPing(): Record<string, unknown> {
    return this.appService.getPing();
  }

  @Get('hello')
  @ApiOperation({ summary: 'Example of i18n usage in controller with @I18n() decorator' })
  @ApiQuery({ name: 'lang', required: false, description: 'Language code (en, es, fr)' })
  @ApiResponse({ status: 200, description: 'Localized hello message' })
  hello(@I18n() i18n: I18nContext): Record<string, string> {
    return {
      message: i18n.t('common.hello'),
      language: i18n.lang
    };
  }

  @Get('hello-service')
  @ApiOperation({ summary: 'Example of i18n usage via injected I18nService' })
  @ApiQuery({ name: 'lang', required: false, description: 'Language code (en, es, fr)' })
  @ApiResponse({ status: 200, description: 'Localized hello message from service' })
  helloService(): Record<string, string> {
    return {
      message: this.appService.getHelloFromContext(),
      approach: 'I18nService injection'
    };
  }

  @Get('hello-explicit')
  @ApiOperation({ summary: 'Example of i18n with explicit language parameter' })
  @ApiQuery({ name: 'lang', required: false, description: 'Language code (en, es, fr)' })
  @ApiResponse({ status: 200, description: 'Hello message in specified language' })
  async helloExplicit(@I18n() i18n: I18nContext): Promise<Record<string, string>> {
    const lang = i18n.lang;
    const message = await this.appService.getHelloWithLang(lang);
    return {
      message,
      language: lang,
      approach: 'I18nService with explicit lang'
    };
  }


}
