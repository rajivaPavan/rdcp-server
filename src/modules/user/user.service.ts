import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './user.schema';
import { AddUserDTO, ResetPasswordDto } from './user.dto';
import { EmailService } from '../../utitlies/email/email.service';
import { OtpService } from 'src/utitlies/otp/otp.service';
import { CryptService } from 'src/utitlies/crypt/crypt.service';


@Injectable()
export class UserService {

  constructor(private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly otpService: OtpService,
    private readonly cryptService: CryptService
  ) { }

  async findAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async findUserByEmail(email: string): Promise<User> {
    return await this.userRepository.findByEmail(email);
  }

  async addUser(dto: AddUserDTO) {
    // add user to database
    const user = new User(dto);

    try{
      await this.userRepository.create(user);
    }
    catch(err){
      throw new ConflictException("User with email already exists");
    }

    // send email to user
    this.emailService.sendEmail(user.email, 'Welcome', 'Welcome to our platform, you can now register');
  }

  async forgotPassword(email: string) {
    // check if user with email exists
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException();
    }

    // Send OTP to user
    this.sendOTP(email);
  }

  async resetPassword(resetPassword: ResetPasswordDto) {
    // Verify OTP
    const res = await this.verifyOTP(resetPassword.email, resetPassword.otp);

    if (!res) {
      throw new UnauthorizedException();
    }

    // Reset Password
    const user = await this.findUserByEmail(resetPassword.email);
    user.password = await this.cryptService.hashPassword(resetPassword.password); // TODO: Hash password

    await this.userRepository.update(user);

    this.emailService.sendEmail(user.email, 'Password Reset', 'Your password has been reset, you can now login with your new password');
  }

  async sendOTP(email: string) {
    await this.otpService.sendOTP(email);
  }

  async verifyOTP(email: string,otp: string) {
    return await this.otpService.verifyOTP(email, otp);
  }
}

class UserExistsException extends Error {
  constructor() {
    super('User with email already exists');
  }
}