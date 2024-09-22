export abstract class IEmailService {
  abstract sendEmail(to: string, subject: string, body: string): Promise<void>;
}
