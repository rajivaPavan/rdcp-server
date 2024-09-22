import { Injectable } from '@nestjs/common';
import { IEmailService } from './email.service';
import { MailerService } from '@nestjs-modules/mailer';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class NodeMailerService extends IEmailService {

  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  @OnEvent('user.account-creation')
  async handleUserAccountCreationEvent(event: { email: string; name: string }) {
    const { email, name } = event;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Account Created',
      template: 'account-creation',
      context: {
        name,
      },
    });
  }

  @OnEvent('user.password-reset')
  async handleUserPasswordResetEvent(event: { email: string; name: string; link: string }) {
    const { email, name, link } = event;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset',
      template: 'password-reset',
      context: {
        name,
        link,
      },
    });
  }
}
