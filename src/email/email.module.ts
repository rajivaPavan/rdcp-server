import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { EmailController } from './email.controller';
import { NodeMailerService } from './nodemailer-email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.sendgrid.net',
          port: Number('587'),
          auth: {
            user: 'apikey',
            pass: configService.get<string>('SENDGRID_API_KEY'),
          },
        },
        defaults: {
          from: '"RDCP" <user-ebf7f8fa-5074-4324-be3a-0ad32cbd1de7@mailslurp.biz>',
        },
        preview: true,
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [NodeMailerService],
  controllers: [EmailController],
  exports: [NodeMailerService],
})
export class EmailModule {}
