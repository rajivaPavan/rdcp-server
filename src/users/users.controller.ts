import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.schema';

import { AddUserDTO, UserDTO } from './dtos/add-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from './roles.decorator';
import { UserRoleEnum } from './entities/user-role.enum';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) { }

  @Get()
  async getUsers(): Promise<User[]> {
    return await this.userService.getAllUsers();
  }

  @Get('search')
  async searchByEmail(@Query('email') email: string): Promise<UserDTO[]> {
    if (!email) {
      return [];
    }
    return await this.userService.searchByEmail(email);
  }

  @Post()
  @Roles(UserRoleEnum.ADMIN)
  async addUsers(@Body() dto: { users: AddUserDTO[] }) {

    if (!dto.users || dto.users.length === 0) {
      throw new BadRequestException('No users to add');
    }

    return await this.userService.addUsers(dto);
  }

}
