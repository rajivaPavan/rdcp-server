import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Logger } from '@nestjs/common'; // Optionally, add logging

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name); // Add logger

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) {
      this.logAndThrowUnauthorized('No token provided');
    }

    try {
      // Verifies the token and checks expiration internally
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });

      // Attach user and sessionId to request object
      request.user = {
        id: payload.sub,
        email: payload.email ?? null, // email may not be available
        role: payload.role ?? null, // role may not be available
      };

    } catch (error) {
      this.logAndThrowUnauthorized('Invalid token', error.message);
    }

    return true;
  }

  /**
   * Extract token from authorization header or cookies (if needed).
   */
  private extractToken(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer') {
        return token;
      }
    }
    // Optionally, check cookies (if tokens are stored in cookies)
    return request.cookies?.token; // Add fallback to cookies if necessary
  }

  /**
   * Helper method to log errors and throw UnauthorizedException
   */
  private logAndThrowUnauthorized(message: string, errorDetails?: string): never {
    this.logger.error(`${message}. ${errorDetails ?? ''}`);
    throw new UnauthorizedException(message);
  }
}
