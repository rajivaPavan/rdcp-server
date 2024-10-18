import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { NodeMailerService } from './nodemailer-email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerConfigFactory } from './mailer.config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const factory = new MailerConfigFactory()
        return factory.create(configService);
      },
    }),
  ],
  providers: [NodeMailerService],
  exports: [NodeMailerService],
})
export class EmailModule { }


