import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { ConfigService } from "@nestjs/config";
import { join } from "path/posix";

export class MailerConfigFactory {

  create(configService: ConfigService) {
    return {
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
    };
  };
}
