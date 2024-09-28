import { Injectable, Logger } from '@nestjs/common';
import { IEmailService } from './email.service';
import { MailerService } from '@nestjs-modules/mailer';
import { OnEvent } from '@nestjs/event-emitter';
import {
  UserAccountCreationEvent,
  UserPasswordResetEvent,
} from 'src/interface/event-types.interface';

@Injectable()
export class NodeMailerService extends IEmailService {
  private readonly logger = new Logger(NodeMailerService.name);
  constructor(private readonly mailerService: MailerService) {
    super();
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
      accountCreationLink: 'http://localhost:5173/register',
    });
  }

  @OnEvent('user.password-reset')
  async handleUserPasswordResetEvent(event: UserPasswordResetEvent) {
    this.logger.log(`Sending password reset email to ${event.email}`);
    const { email, ...context } = event;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset',
      template: 'password-reset',
      context: context,
    });
  }
}
