// src/admin/admin.controller.ts
import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AddUserDTO } from './dtos/add-user.dto';
import { BulkAddUsersDTO } from './dtos/bulk-add-users.dto';
import { CreateWhitelistDto } from './dtos/create-whitelist.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('add-user')
  async addUser(@Body() addUserDto: AddUserDTO) {
    return this.adminService.addUser(addUserDto);
  }

  @Post('bulk-add-users')
  async bulkAddUsers(@Body() bulkAddUsersDto: BulkAddUsersDTO[]) {
    return this.adminService.bulkAddUsers(bulkAddUsersDto);
  }

  @Post('whitelist')
  async addWhitelist(@Body() createWhitelistDto: CreateWhitelistDto) {
    return this.adminService.addWhitelistDomain(createWhitelistDto);
  }

  @Delete('whitelist/:domain')
  async removeWhitelist(@Param('domain') domain: string) {
    return this.adminService.removeWhitelistDomain(domain);
  }

  @Get('users')
  async getAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Get('whitelist')
  async getAllWhitelistedDomains() {
    return this.adminService.findAllWhitelist();
  }
}
