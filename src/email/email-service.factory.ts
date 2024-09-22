import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from 'src/common/environments.enum';
import { IEmailService } from './email.service';
import { MockEmailService } from './mock-email.service';
import { NodeMailerService } from './nodemailer-email.service';

@Injectable()
export class EmailServiceFactory {
  constructor(private readonly configService: ConfigService) {}

  createEmailService(): typeof IEmailService {
    const env = this.configService.get<Environment>('NODE_ENV');
    switch (env) {
      case Environment.Staging:
      case Environment.Production:
        return NodeMailerService;
      default:
        return MockEmailService;
    }
  }
}
