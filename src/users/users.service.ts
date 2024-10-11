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
import { AddUserDTO, UserDTO } from './dtos/add-user.dto';
import { TypedEventEmitter } from 'src/common/event-emitter/typed-event-emitter.class';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly otpService: OtpService,
    private readonly cryptService: CryptService,
    private readonly eventEmitter: TypedEventEmitter,
  ) { }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async findUserByEmail(email: string): Promise<User> {
    return await this.userRepository.findUserByEmail(email);
  }

  async searchByEmail(email: string): Promise<UserDTO[]> {
    const searchRes = await this.userRepository.searchByEmail(email);
    return searchRes.map((user) => UserDTO.fromUser(user));
  }

  async findUser(userId: string): Promise<string> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user.email;
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

  async addUsers({users}:{
    users: AddUserDTO[]
  }){

    // add all users and return success count and failures with failed users
    let successCount = 0;
    let failedUsers: AddUserDTO[] = [];

    for(const user of users){
      try{
        await this.addUser(user);
        successCount++;
      } catch(e){
        failedUsers.push(user);
      }
    }

    return {
      successCount,
      failedUsers
    }
  }

  async forgotPassword(email: string) {
    // check if user with email exists
    const user = await this.findUserByEmail(email);
    // If user does not exist, do nothing - Error should not be thrown here
    // This is to prevent user enumeration attacks
    if (!user) {
      return;
    }

    // Send OTP to user
    this.sendOTP(user);
  }

  async resetPassword(resetDto: ResetPasswordDto) {
    // Verify OTP
    const res = await this.verifyOTP(resetDto.email, resetDto.otp);

    if (!res) {
      throw new InvalidOtpException();
    }

    // Reset Password
    const user = await this.findUserByEmail(resetDto.email);
    user.password = await this.cryptService.hashPassword(resetDto.password);

    await this.userRepository.update(user);

    return {
      success: true,
    };
  }

  private async sendOTP(user: User) {
    await this.otpService.sendOTP(user);
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
