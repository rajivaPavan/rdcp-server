import { Module } from '@nestjs/common';
import { EmailServiceFactory } from './email-service.factory';
import { IEmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { join } from 'path';
import { EmailController } from './email.controller';
import { NodeMailerService } from './nodemailer-email.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.sendgrid.net',
        port: Number('587'),
        auth: {
          user: 'apiKey',
          pass: process.env.SENDGRID_API_KEY,
        },
      },
      defaults: {
        from: '"RDCP" <admin@rdcp.com>',
      },
      preview: true,
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new EjsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [
    NodeMailerService
  ],
  controllers: [EmailController],
  exports: [NodeMailerService]
})
export class EmailModule { }
