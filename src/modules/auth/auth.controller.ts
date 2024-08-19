import { Body, Controller, Get, Post, Req, Request, UseGuards } from "@nestjs/common";
import AuthenticationService from "./auth.service";
import { UserService } from "../user/user.service";
import { ResetPasswordDto } from "../user/user.dto";

@Controller('auth')
export class AuthenticationController {
    constructor(
        private readonly authService: AuthenticationService,
        private readonly userService: UserService
    ) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
        return await this.authService.login(loginDto.email, loginDto.password);
    }

    @Post('logout')
    async logout(@Req() req): Promise<any> {
        const token = req.headers.authorization.split(' ')[1];
        const userId = req.user.id;
        return await this.authService.logout(token, userId);
    }

    @Post('forgot-password')
    async forgotPassword(@Body() { email }: { email: string }) {
        return await this.userService.forgotPassword(email);
    }

    @Post('reset-password')
    async resetPassword(@Body() resetPassword: ResetPasswordDto) {
        return await this.userService.resetPassword(resetPassword);
    }

}