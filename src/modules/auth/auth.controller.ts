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

    @Post('logout')
    async logout() {
        return '';
    }

}