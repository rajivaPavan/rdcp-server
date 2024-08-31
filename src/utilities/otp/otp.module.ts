import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OTPModule {}
