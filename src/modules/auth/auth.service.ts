import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";

// AuthenticationService
@Injectable()
export class AuthenticationService {

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) { }

    async login(email: string, password: string) {
        const user = await this.userService.findUserByEmail(email);

        // Compare the password
        if (!user || user.password !== password) {
            throw new UnauthorizedException();
        }

        // Generate JWT token
        const payload = { email: user.email, name: user.name };
        const access_token = this.jwtService.sign(payload);

        return {
            access_token
        };
    }

    async logout() {
        return 'logout';
    }

    async resetPassword(email: string) {
        return 'resetPassword';
    }

    verifyOTP(email: string, otp: string): boolean {
        return true;
    }
}

export default AuthenticationService;