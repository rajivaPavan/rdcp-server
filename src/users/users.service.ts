import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.schema';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { OtpService } from '../utilities/otp/otp.service';
import { CryptService } from '../utilities/crypt/crypt.service';
import { AddUserDTO, UserDTO } from './dtos/add-user.dto';
import { TypedEventEmitter } from 'src/common/event-emitter/typed-event-emitter.class';
import { AccountSetupDto } from 'src/auth/dtos/account.dto';
import { DomainsRepository } from './domains.repository';
import { WhitelistedDomain } from './entities/whitelisted-domain.schema';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly domainsRepository: DomainsRepository,
    private readonly otpService: OtpService,
    private readonly cryptService: CryptService,
    private readonly eventEmitter: TypedEventEmitter,
  ) { }

  async getAllUsers(
    email: string,
    role: string,
    limit: number,
    page: number,
  ): Promise<{
    users: Partial<User>[],
    total: number
  }> {
    return await this.userRepository.find({
      email: email ? email : undefined,
      role: role ? role : undefined,
    }, limit, page);
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
      throw new NotFoundException('User not found');
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

    await this.createUser(user);

    // send email to user
    this.eventEmitter.emit('user.account-creation', {
      email: user.email,
      name: user.name,
    });
  }

  private async createUser(user: User) {
    await this.userRepository.create(user);
  }

  async addUsers({ users }: {
    users: AddUserDTO[]
  }) {

    // add all users and return success count and failures with failed users
    let successCount = 0;
    let failedUsers: AddUserDTO[] = [];

    for (const user of users) {
      try {
        await this.addUser(user);
        successCount++;
      } catch (e) {
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
    await this.updateUserPassword(resetDto);

    return {
      success: true,
    };
  }

  private async updateUserPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.findUserByEmail(resetPasswordDto.email);
    user.password = await this.cryptService.hashPassword(resetPasswordDto.password);
    await this.userRepository.update({
      ...user,
      verified: true,
    });
  }

  private async sendOTP(user: User, isNewUser = false) {
    await this.otpService.sendOTP(user, isNewUser);
  }

  private async verifyOTP(email: string, otp: string) {
    return await this.otpService.verifyOTP(email, otp);
  }

  public async accountSetup(email: string) {

    const user = await this.findUserByEmail(email);

    // extract email domain
    const domain = email.split('@')[1];

    if (user) {
      if (user.verified) throw new UserExistsException();
    }
    else {
      if (domain !== 'cse.mrt.ac.lk') throw new ForbiddenException('You are not allowed to register');
      await this.createUser(new User({ email, name: email.split('@')[0] }));
    }

    this.sendOTP(new User({ email }), true);

    return {
      success: true
    }
  }

  public async accountSetupPost(dto: AccountSetupDto) {

    // Verify OTP
    const res = await this.verifyOTP(dto.email, dto.otp);

    if (!res) {
      throw new InvalidOtpException();
    }

    await this.resetPassword({
      email: dto.email,
      otp: dto.otp,
      password: dto.password,
    });

    return {
      success: true,
    };
  }

  async deleteUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.delete(userId);
  }

  async getDomains() {
    return await this.domainsRepository.find({});
  }

  async addDomain(domain: string) {
    await this.domainsRepository.create(new WhitelistedDomain({ domain }));
  }

  async deleteDomain(domainId: string) {
    await this.domainsRepository.deleteDomain(domainId);
  }
}

class UserExistsException extends ConflictException {
  constructor() {
    super('User with email already exists');
  }
}

class InvalidOtpException extends ForbiddenException {
  constructor() {
    super('Invalid OTP');
  }
}
