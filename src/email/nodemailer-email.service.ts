import { Inject, Injectable, Logger } from '@nestjs/common';
import { IEmailService } from './email.service';
import { MailerService } from '@nestjs-modules/mailer';
import { OnEvent } from '@nestjs/event-emitter';
import {
  UserAccountCreationEvent,
  UserPasswordResetEvent,
} from 'src/interface/event-types.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NodeMailerService extends IEmailService {
  private webClient: string;
  private readonly logger = new Logger(NodeMailerService.name);
  constructor(
    private readonly mailerService: MailerService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    super();
  }

  onModuleInit() {
    this.webClient = this.configService.get('WEB_CLIENT');
    console.log("Web client:", this.webClient);
  }

  async sendEmail(
    to: string,
    subject: string,
    template: string,
    context: any,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: to,
        subject: subject,
        template: template,
        context: context,
      });
    } catch (e) {
      this.logger.error(e);
    }
  }

  @OnEvent('user.account-creation')
  async handleUserAccountCreationEvent(event: UserAccountCreationEvent) {
    this.logger.log(`Sending account creation email to ${event.email}`);
    const { email, name } = event;
    this.sendEmail(email, 'Account Created', 'account-creation', {
      name,
      accountCreationLink: `${this.webClient}/register`,
    });
  }

  @OnEvent('user.password-reset')
  async handleUserPasswordResetEvent(event: UserPasswordResetEvent) {
    this.logger.log(`Sending password reset email to ${event.email}`);
    const { email, ...context } = event;
    this.sendEmail(email, 'Password Reset', 'password-reset', context);
  }

  @OnEvent('user.account-setup')
  async handleUserAccountSetupEvent(event: UserAccountCreationEvent) {
    this.logger.log(`Sending account setup email to ${event.email}`);
    const { email, ...context } = event;
    this.sendEmail(email, 'Account Setup', 'account-setup', context);
  }
}
