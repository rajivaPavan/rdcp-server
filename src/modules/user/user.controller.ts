import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';
import { AddUserDTO, ResetPasswordDto } from './user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  async getAllUsers(): Promise<User[]> {
    return await this.userService.findAllUsers();
  }

  // TODO: Add Admin Guard
  // Endpoint used by the admin to add a new user
  @Post()
  async addUser(@Body() dto: AddUserDTO) {
      await this.userService.addUser(dto);
  }

  // TODO: Add Admin Guard and Implement
  // Endpoint used by the user to admin to bulk add users
  @Post('bulk')
  async bulkAddUsers(@Body() users: AddUserDTO[]) {
    throw new Error('Not implemented');
  }
}
