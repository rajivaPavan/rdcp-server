import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';
import { AddUserDTO, ResetPasswordDto } from './user.dto';

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

  @Post('forgot-password')
  async forgotPassword(@Body() { email }: { email: string }) {
      return await this.userService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPassword: ResetPasswordDto){
      return await this.userService.resetPassword(resetPassword);
  }
}
