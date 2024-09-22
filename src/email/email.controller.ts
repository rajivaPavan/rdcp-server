import { Controller, Get, Query } from '@nestjs/common';
import { IEmailService } from './email.service';
import { NodeMailerService } from './nodemailer-email.service';

@Controller('email')
export class EmailController {
    constructor(private readonly emailService: NodeMailerService) { }

    // Endpoint to preview email template
    @Get('preview')
    async previewEmail(@Query('template') template: string, @Query('name') name: string) {
        const html = await this.emailService.previewTemplate(template, { name });
        return html; // Return the HTML response for preview
    }
}
