import { Injectable, Logger } from '@nestjs/common';
import { MailerService, ISendMailOptions } from '@nestjs-modules/mailer';

export interface IMailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export interface ITemplateMailOptions extends IMailOptions {
  template: string;
  context?: Record<string, unknown>;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly mailerService: MailerService;

  constructor(mailerService: MailerService) {
    this.mailerService = mailerService;
  }

  async send(options: IMailOptions): Promise<void> {
    try {
      const mailOptions: ISendMailOptions = {
        to: options.to,
        subject: options.subject,
        ...(options.html && { html: options.html }),
        ...(options.text && { text: options.text }),
        ...(options.from && { from: options.from }),
      };

      await this.mailerService.sendMail(mailOptions);
      this.logger.log(`Email sent to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
    } catch (error) {
      const recipient = Array.isArray(options.to) ? options.to.join(', ') : options.to;
      this.logger.error(`Failed to send email to ${recipient}:`, error);
      throw error;
    }
  }

  async sendTemplate(options: ITemplateMailOptions): Promise<void> {
    try {
      const mailOptions: ISendMailOptions = {
        to: options.to,
        subject: options.subject,
        template: options.template,
        ...(options.context && { context: options.context }),
        ...(options.from && { from: options.from }),
      };

      await this.mailerService.sendMail(mailOptions);
      this.logger.log(`Template email sent to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
    } catch (error) {
      const recipient = Array.isArray(options.to) ? options.to.join(', ') : options.to;
      this.logger.error(`Failed to send template email to ${recipient}:`, error);
      throw error;
    }
  }
}
