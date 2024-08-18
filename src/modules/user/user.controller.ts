import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';
import { AddUserDTO } from './user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<User[]> {
    return await this.userService.findAllUsers();
  }
  

  // TODO: Add Admin Guard
  @Post()
  async addUser(@Body() dto: AddUserDTO) {
    await this.userService.addUser(dto);
  }

}
