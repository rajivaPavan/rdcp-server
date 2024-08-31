import { Injectable, Logger } from '@nestjs/common';
import { IEmailService } from './email.service';

@Injectable()
export class MockEmailService implements IEmailService {
  async sendEmail(to: string, subject: string, body: string) {
    console.log(`Sending email to ${to} with subject ${subject}`);
    console.log(`Body: ${body}`);
  }
}
