import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CryptService } from '../utilities/crypt/crypt.service';
import { InvalidCredentialsException } from './exceptions/invalid-credentials.exception';
import { User } from '../users/entities/user.schema';
import { InvalidRefreshToken as InvalidRefreshTokenException } from './exceptions/invalid-refresh-token.exception';
import { ConfigService } from '@nestjs/config';

enum JwtToken {
  AccessToken,
  RefreshToken,
}


// AuthenticationService
@Injectable()
export class AuthenticationService {

  constructor(
    private readonly jwtService: JwtService,
    private readonly cryptService: CryptService,
    private readonly configService: ConfigService,
  ) { }

  // accessToken expiration
  private readonly accessTokenExpiration = '15m';
  // refreshToken expiration
  private readonly refreshTokenExpiration = '7d';

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw InvalidRefreshTokenException.withMessage('Refresh token is required');
    }

    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      // Verify the refresh token and extract the payload
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtSecret,
      });

      // Generate a new access token with the same payload
      const newAccessToken = this.createToken(payload);

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new InvalidRefreshTokenException();
    };
  }

  createToken(payload: any, type: JwtToken = JwtToken.AccessToken) {
    const expiration = type === JwtToken.AccessToken ? this.accessTokenExpiration : this.refreshTokenExpiration;
    return this.jwtService.sign({
      email: payload.email,
      sub: payload.sub,
      role: payload.role,
    }, {
      expiresIn: expiration,
    });
  }

  async login(user: User, password: string) {
    // Check if user exists and password is correct
    if (!user) {
      throw new InvalidCredentialsException();
    }

    if (!(await this.cryptService.comparePassword(password, user.password))) {
      throw new InvalidCredentialsException();
    }

    // Generate JWT token
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

  async loginV2(user: User, password: string): Promise<LoginV2ResponseDto> {
    // Check if user exists and password is correct
    if (!user) {
      throw new InvalidCredentialsException();
    }

    if (!(await this.cryptService.comparePassword(password, user.password))) {
      throw new InvalidCredentialsException();
    }

    // Generate access and refresh tokens
    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role,
    };

    // Expiration time for access token is 15 minutes
    const access_token = this.createToken(payload);

    // Expiration time for refresh token is 7 days
    const refresh_token = this.createToken(payload, JwtToken.RefreshToken);

    return {
      email: user.email,
      role: user.role,
      accessToken: access_token,
      refreshToken: refresh_token,
    };
  }
  async extractUserFromRequest(request: Request): Promise<{
    id: string;
    email: string | null;
    role: string | null;
  }> {
    const token = this.extractToken(request);
    if (!token) {
      this.logAndThrowUnauthorized('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Return the user object with extracted information
      return {
        id: payload.sub,
        email: payload.email ?? null,
        role: payload.role ?? null,
      };

    } catch (error) {
      this.logAndThrowUnauthorized('Invalid token', error.message);
    }
  }

  private extractToken(request: Request): string | undefined {
    //@ts-ignore
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer') {
        return token;
      }
    }

    //@ts-ignore
    return request.cookies?.token;
  }

  private logAndThrowUnauthorized(message: string, errorDetails?: string): never {
    throw new UnauthorizedException(message);
  }

}

export default AuthenticationService;
