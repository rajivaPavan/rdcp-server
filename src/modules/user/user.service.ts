import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './user.schema';
import { AddUserDTO } from './user.dto';
import { EmailService } from '../../utitlies/email/email.service';
import { OtpService } from 'src/utitlies/otp/otp.service';


@Injectable()
export class UserService {

  constructor(private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly otpService: OtpService
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

    await this.userRepository.create(user);

    // send email to user
    this.emailService.sendEmail(user.email, 'Welcome', 'Welcome to our platform, you can now register');
  }

  async sendOTP(email: string) {
    await this.otpService.sendOTP(email);
  }
}
