import { IEmailService } from './email.service';

export class NodeMailerService extends IEmailService {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
