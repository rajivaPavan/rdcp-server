import { Injectable } from '@nestjs/common';
import { IEmailService } from './email.service';

@Injectable()
export class NodeMailerService extends IEmailService {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
