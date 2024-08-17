import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import AuthenticationService from "./auth.service";
import { AuthGuard } from "./auth.guard";

@Controller('auth')
export class AuthenticationController {
    constructor(private readonly authService: AuthenticationService) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return await this.authService.login(loginDto.email, loginDto.password);
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    @Post('logout')
    async logout() {
        return '';
    }

    @Post('reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return await this.authService.resetPassword(resetPasswordDto.email);
    }

    @Post('verify-otp')
    async verifyOTP(@Body() verifyOtpDto: VerifyOtpDto) {
        return await this.authService.verifyOTP(verifyOtpDto.email, verifyOtpDto.otp);
    }

}