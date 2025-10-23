import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class AppService {
  private readonly i18n: I18nService;

  constructor(i18n: I18nService) {
    this.i18n = i18n;
  }

  getPing(): Record<string, unknown> {
    return {
      ping: 'pong',
      ts: new Date().toISOString(),
    };
  }

  /**
   * Example using I18nService with explicit language
   */
  async getHelloWithLang(lang: string): Promise<string> {
    return this.i18n.translate('common.hello', { lang });
  }

  /**
   * Example using I18nService with current context
   */
  getHelloFromContext(): string {
    const lang = I18nContext.current()?.lang ?? 'en';
    return this.i18n.translate('common.hello', { lang });
  }

  /**
   * Example with variables using I18nService
   */
  getValidationMessage(field: string, min: number): string {
    const lang = I18nContext.current()?.lang ?? 'en';
    return this.i18n.translate('common.validation.min_length', {
      lang,
      args: { field, min: min.toString() }
    });
  }
}
