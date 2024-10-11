import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Req,
  Version,
} from '@nestjs/common';
import AuthenticationService from './auth.service';
import { UsersService } from '../users/users.service';
import { ResetPasswordDto } from '../users/dtos/reset-password.dto';
import { LoginDto } from './dtos/login.dto';
import { EmailRequiredException } from './exceptions/email-required.exception';
import { AccountSetupDto } from './dtos/account.dto';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly userService: UsersService,
  ) {}

  private readonly logger = new Logger(AuthenticationController.name);

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    this.logger.debug(`Login request for ${loginDto.email}`);
    const user = await this.userService.findUserByEmail(loginDto.email);
    return await this.authService.login(user, loginDto.password);
  }

  @Version('2')
  @Post('login')
  async loginV2(@Body() loginDto: LoginDto): Promise<LoginV2ResponseDto>{
    this.logger.debug(`Login request for ${loginDto.email}`);
    const user = await this.userService.findUserByEmail(loginDto.email);
    return await this.authService.loginV2(user, loginDto.password);
  }

  // endpoint to refresh the accessToken
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string){
    this.logger.debug('Refresh request');
    return await this.authService.refresh(refreshToken);
  }

  @Get('reset-password')
  async forgotPassword(@Query('email') email: string) {
    this.logger.debug(`Forgot password request for ${email}`);

    if (!email) {
      throw new EmailRequiredException();
    }

    await this.userService.forgotPassword(email);

    return {
      message: 'Request was successful',
    };
  }

  @Get('register')
  async accountSetup(@Query('email') email: string) {
    this.logger.debug(`Account setup request for ${email}`);
    return await this.userService.accountSetup(email);
  }

  @Post('register')
  async accountSetupPost(@Body() accountSetup: AccountSetupDto) {
    this.logger.debug(`Account setup request for ${accountSetup.email}`);
    await this.userService.accountSetupPost(accountSetup);
    return {
      message: 'Account setup was successful',
    };
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPassword: ResetPasswordDto) {
    this.logger.debug(`Reset password request for ${resetPassword.email}`);
    await this.userService.resetPassword(resetPassword);
    return {
      message: 'Password reset was successful',
    };
  }
}
