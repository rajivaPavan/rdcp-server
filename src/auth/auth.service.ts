import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CryptService } from '../utilities/crypt/crypt.service';
import { InvalidCredentialsException } from './exceptions/invalid-credentials.exception';
import { User } from '../users/entities/user.schema';

// AuthenticationService
@Injectable()
export class AuthenticationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly cryptService: CryptService,
  ) {}

  async login(user: User, password: string) {
    // Check if user exists and password is correct
    if (!user) {
      throw new InvalidCredentialsException();
    }

    if (!(await this.cryptService.comparePassword(password, user.password))) {
      throw new InvalidCredentialsException();
    }

    // Generate JWT token
    // TODO: Payload should be sessionId and user data should be fetched from the session store
    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      email: user.email,
      role: user.role,
      jwt: access_token,
    };
  }

  async logout(sessionId: string, userId: string) {
    // Implement logout functionality
  }
}

export default AuthenticationService;
