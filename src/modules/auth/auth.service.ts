import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { CryptService } from "../../utitlies/crypt/crypt.service";

// AuthenticationService
@Injectable()
export class AuthenticationService {

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly cryptService: CryptService
    ) { }

    async login(email: string, password: string) {
        const user = await this.userService.findUserByEmail(email);

        // Check if user exists and password is correct
        if (!user || await this.cryptService.comparePassword(password, user.password)) {
            throw new UnauthorizedException();
        }

        // Generate JWT token
        const payload = { email: user.email, name: user.name };
        const access_token = this.jwtService.sign(payload);

        return {
            access_token
        };
    }

    async register(email: string){
        // check if user with email exists


    }

    async logout() {
        return 'logout';
    }

    async resetPassword(email: string) {
        // check if user with email exists
        const user = await this.userService.findUserByEmail(email);

        if (!user) {
            throw new UnauthorizedException();
        }

        // Send OTP to user
        this.userService.sendOTP(email);
    }

    verifyOTP(email: string, otp: string): boolean {
        return true;
    }
}

export default AuthenticationService;