import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {

    private readonly logger = new Logger(EmailService.name);

    async sendEmail(to: string, subject: string, body: string) {
        this.logger.log(`Sending email to ${to} with subject ${subject}`);
        this.logger.log(`Body: ${body}`);

        // TODO: Implement email sending logic
    }
}
