import * as ejs from 'ejs';
import { readFileSync } from "fs";
import { join } from "path";

export abstract class IEmailService {
  abstract sendEmail(to: string, subject: string, body: string): Promise<void>;

  // Method to render and return the email template for preview
  async previewTemplate(templateName: string, data: any): Promise<string> {
    const templatePath = join(__dirname, 'templates', `${templateName}.ejs`);
    const template = readFileSync(templatePath, 'utf-8');

    // Render the EJS template with the provided data
    const html = ejs.render(template, data);
    return html;
  }
}
