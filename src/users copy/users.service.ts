// src/users/users.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.schema';
import { Whitelist, WhitelistDocument } from './entities/whitelist.schema';
import { AddUserDTO } from './dtos/add-user.dto';
import { BulkAddUsersDTO } from './dtos/bulk-add-users.dto';
import { CreateWhitelistDto } from './dtos/create-whitelist.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Whitelist.name) private whitelistModel: Model<WhitelistDocument>,
  ) {}

  // Add a single user
  async addUser(addUserDto: AddUserDTO): Promise<User> {
    if (!(await this.isWhitelisted(addUserDto.email))) {
      throw new ConflictException('Email domain not whitelisted');
    }
    const user = new this.userModel(addUserDto);
    return user.save();
  }

  // Bulk add users
  async bulkAddUsers(bulkAddUsersDtos: BulkAddUsersDTO[]): Promise<User[]> {
    const validUsers = bulkAddUsersDtos.filter((user) => this.isValidEmail(user.email) && this.isWhitelisted(user.email));
    return this.userModel.insertMany(validUsers);
  }

  // Add a whitelist domain
  async addWhitelistDomain(createWhitelistDto: CreateWhitelistDto): Promise<Whitelist> {
    const domain = new this.whitelistModel(createWhitelistDto);
    return domain.save();
  }

  // Remove a whitelist domain
  async removeWhitelistDomain(domain: string): Promise<void> {
    const result = await this.whitelistModel.deleteOne({ domain });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Domain not found');
    }
  }

  // Helper: Check if email is valid
  private isValidEmail(email: string): boolean {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  }

  // Helper: Check if email domain is whitelisted
  async isWhitelisted(email: string): Promise<boolean> {
    const domain = email.split('@')[1];
    const isWhitelisted = await this.whitelistModel.findOne({ domain });
    return !!isWhitelisted;
  }

  // Get all users
  async findAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  // Get all whitelisted domains
  async findAllWhitelist(): Promise<Whitelist[]> {
    return this.whitelistModel.find().exec();
  }
}
