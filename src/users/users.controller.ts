import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.schema';

import { AddUserDTO } from "./dtos/add-user.dto";

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  async getAllUsers(): Promise<User[]> {
    return await this.userService.findAllUsers();
  }

  // TODO: Add Admin Guard
  // Endpoint used by the admin to add a new user
  @Post()
  async addUser(@Body() dto: AddUserDTO) {
    await this.userService.addUser(dto);
    return { message: 'User added successfully', success: true };
  }

  // TODO: Add Admin Guard and Implement
  // Endpoint used by the user to admin to bulk add users
  @Post('bulk')
  async bulkAddUsers(@Body() users: AddUserDTO[]) {
    throw new Error('Not implemented');
  }
}
