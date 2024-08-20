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
        if (!user) {
            throw new UnauthorizedException("Invalid Credentials");
        }

        if (!await this.cryptService.comparePassword(password, user.password)) {
            throw new UnauthorizedException("Invalid Credentials");
        }

        // Generate JWT token
        // TODO: Payload should be sessionId and user data should be fetched from the session store
        const payload = {
            email: user.email,
            sub: user._id,
            role: user.role
        };

        const access_token = this.jwtService.sign(payload, { expiresIn: '1h' });

        return {
            email: user.email,
            role: user.role,
            jwt: access_token
        };
    }

    async logout(sessionId: string, userId: string) {
        // Implement logout functionality
    }
}

export default AuthenticationService;