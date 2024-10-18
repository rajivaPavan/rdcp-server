import { BadRequestException, Body, Controller, Delete, Get, Logger, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.schema';

import { AddUserDTO, UserDTO } from './dtos/add-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from './roles.decorator';
import { UserRoleEnum } from './entities/user-role.enum';
import { DomainsAdminService } from './admin.service';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(
    private readonly userService: UsersService,
    private readonly domainsAdminService: DomainsAdminService
  ) { }

  @Get()
  async getUsers(
    @Query('email') email: string,
    @Query('role') role: string,
    @Query('limit') limit: number,
    @Query('page') page: number,
  ): Promise<{
    users: Partial<User>[],
    total: number
  }> {
    this.logger.log(`Getting users with email: ${email}, role: ${role}, limit: ${limit}, page: ${page}`);
    const { users, total } = await this.userService.getAllUsers(email, role, limit, page,);
    return {
      users,
      total
    };
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

  @Delete("/:userId")
  @Roles(UserRoleEnum.ADMIN)
  async deleteUsers(
    @Param('userId') userId: string,
  ) {
    return await this.userService.deleteUser(userId);
  }

  @Get('/domains')
  @Roles(UserRoleEnum.ADMIN)
  async getDomains() {
    this.logger.log('Getting domains');
    return await this.domainsAdminService.getDomains();
  }

  @Post('/domains')
  @Roles(UserRoleEnum.ADMIN)
  async addDomain(@Body('domain') domain: string) {
    return await this.domainsAdminService.addDomain(domain);
  }

  @Delete('/domains/:domainId')
  @Roles(UserRoleEnum.ADMIN)
  async deleteDomain(@Param('domainId') domainId: string) {
    return await this.domainsAdminService.deleteDomain(domainId);
  }

}
