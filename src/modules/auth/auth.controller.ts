import { BadRequestException, Body, Controller, Get, Logger, Param, Post, Query, Req, Request, UseGuards } from "@nestjs/common";
import AuthenticationService from "./auth.service";
import { UserService } from "../user/user.service";
import { ResetPasswordDto } from "../user/user.dto";

@Controller('auth')
export class AuthenticationController {
    constructor(
        private readonly authService: AuthenticationService,
        private readonly userService: UserService
    ) { }

    private readonly logger = new Logger(AuthenticationController.name);

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
        this.logger.debug(`Login request for ${loginDto.email}`);
        return await this.authService.login(loginDto.email, loginDto.password);
    }

    @Post('logout')
    async logout(@Req() req): Promise<any> {
        const token = req.headers.authorization.split(' ')[1];
        const userId = req.user.id;
        return await this.authService.logout(token, userId);
    }

    @Get('reset-password')
    async forgotPassword(@Query('email') email: string) {
        
        this.logger.debug(`Forgot password request for ${email}`);
        
        if(!email) {
            throw new BadRequestException('Email is required');
        }

        await this.userService.forgotPassword(email);
        
        return {
            message: 'Request was successful',
        }
    }

    @Post('reset-password')
    async resetPassword(@Body() resetPassword: ResetPasswordDto) {
        this.logger.debug(`Reset password request for ${resetPassword.email}`);
        await this.userService.resetPassword(resetPassword);
        return {
            message: 'Password reset was successful',
        }
    }

}