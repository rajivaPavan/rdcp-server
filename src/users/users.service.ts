import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.schema';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { EmailService } from '../utilities/email/email.service';
import { OtpService } from '../utilities/otp/otp.service';
import { CryptService } from '../utilities/crypt/crypt.service';
import { AddUserDTO } from './dtos/add-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly emailService: EmailService,
    private readonly otpService: OtpService,
    private readonly cryptService: CryptService,
  ) {}

  async findAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async findUserByEmail(email: string): Promise<User> {
    return await this.userRepository.findByEmail(email);
  }

  async addUser(dto: AddUserDTO) {
    // add user to database
    const user = new User(dto);

    // check if user with email exists
    const existingUser = await this.findUserByEmail(user.email);

    if (existingUser) {
      throw new UserExistsException();
    }

    await this.userRepository.create(user);

    // send email to user
    this.emailService.sendEmail(
      user.email,
      'Welcome',
      'Welcome to our platform, you can now register',
    );
  }

  async forgotPassword(email: string) {
    // check if user with email exists
    const user = await this.findUserByEmail(email);
    if (!user) {
      return;
    }

    // Send OTP to user
    this.sendOTP(email);
  }

  async resetPassword(resetPassword: ResetPasswordDto) {
    // Verify OTP
    const res = await this.verifyOTP(resetPassword.email, resetPassword.otp);

    if (!res) {
      throw new InvalidOtpException();
    }

    // Reset Password
    const user = await this.findUserByEmail(resetPassword.email);
    user.password = await this.cryptService.hashPassword(
      resetPassword.password,
    );

    await this.userRepository.update(user);

    this.emailService.sendEmail(
      user.email,
      'Password Reset',
      'Your password has been reset, you can now login with your new password',
    );
  }

  private async sendOTP(email: string) {
    await this.otpService.sendOTP(email);
  }

  private async verifyOTP(email: string, otp: string) {
    return await this.otpService.verifyOTP(email, otp);
  }
}

class UserExistsException extends ConflictException {
  constructor() {
    super('User with email already exists');
  }
}

class InvalidOtpException extends UnauthorizedException {
  constructor() {
    super('Invalid OTP');
  }
}
