import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.schema';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { OtpService } from '../utilities/otp/otp.service';
import { CryptService } from '../utilities/crypt/crypt.service';
import { AddUserDTO } from './dtos/add-user.dto';
import { TypedEventEmitter } from 'src/event-emitter/typed-event-emitter.class';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly otpService: OtpService,
    private readonly cryptService: CryptService,
    private readonly eventEmitter: TypedEventEmitter,
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
    this.eventEmitter.emit('user.account-creation', {
      email: user.email,
      name: user.name,
    });
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

    this.eventEmitter.emit('user.password-reset', {
      email: user.email,
      name: user.name,
      link: 'https://example.com/login'
    });
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
