// src/users/user.controller.ts
import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { AddUserDTO } from './dtos/add-user.dto';
import { BulkAddUsersDTO } from './dtos/bulk-add-users.dto';
import { CreateWhitelistDto } from './dtos/create-whitelist.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Add a single user
  @Post('add')
  async addUser(@Body() addUserDto: AddUserDTO) {
    return this.usersService.addUser(addUserDto);
  }

  // Bulk add users
  @Post('bulk-add')
  async bulkAddUsers(@Body() bulkAddUsersDtos: BulkAddUsersDTO[]) {
    return this.usersService.bulkAddUsers(bulkAddUsersDtos);
  }

  // Add a whitelist domain
  @Post('whitelist')
  async addWhitelist(@Body() createWhitelistDto: CreateWhitelistDto) {
    return this.usersService.addWhitelistDomain(createWhitelistDto);
  }

  // Remove a whitelist domain
  @Delete('whitelist/:domain')
  async removeWhitelist(@Param('domain') domain: string) {
    return this.usersService.removeWhitelistDomain(domain);
  }

  // Get all users
  @Get()
  async getAllUsers() {
    return this.usersService.findAllUsers();
  }

  // Get all whitelisted domains
  @Get('whitelist')
  async getAllWhitelistedDomains() {
    return this.usersService.findAllWhitelist();
  }
}
