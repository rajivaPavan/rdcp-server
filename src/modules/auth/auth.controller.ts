import { Body, Controller, Get, Post, Req, Request, UseGuards } from "@nestjs/common";
import AuthenticationService from "./auth.service";
import { AuthGuard } from "./auth.guard";

@Controller('auth')
export class AuthenticationController {
    constructor(private readonly authService: AuthenticationService) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
        return await this.authService.login(loginDto.email, loginDto.password);
    }

    @Post('logout')
    async logout(@Req () req): Promise<any> {
        const token = req.headers.authorization.split(' ')[1];
        const userId = req.user.id;
        return await this.authService.logout(token, userId);
    }

}