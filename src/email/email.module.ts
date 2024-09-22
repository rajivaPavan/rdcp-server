import { Module } from '@nestjs/common';
import { EmailServiceFactory } from './email-service.factory';
import { IEmailService } from './email.service';

@Module({
  providers: [
    EmailServiceFactory,
    {
      provide: IEmailService,
      useFactory: (emailProviderFactory: EmailServiceFactory) => {
        return emailProviderFactory.createEmailService();
      },
      inject: [EmailServiceFactory],
    },
  ],
  exports: [IEmailService],
})
export class EmailModule {}
