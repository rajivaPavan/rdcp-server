import { Module } from '@nestjs/common';
import { EmailServiceFactory } from './email-service.factory';
import { IEmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

@Module({
  imports: [
    MailerModule.forRoot({  
      transport: {  
        host: '<host>',  
        port: Number('<port>'),  
        secure: false,  
        auth: {  
          user: '<username>',  
          pass: '<password>',  
        },  
      },  
      defaults: {  
        from: '"From Name" <from@example.com>',  
      },  
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
