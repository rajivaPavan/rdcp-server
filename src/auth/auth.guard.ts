import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core'; // Import Reflector
import { Logger } from '@nestjs/common';
import { UserRoleEnum } from 'src/users/entities/user-role.enum';
import { ROLES_KEY } from 'src/users/roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly reflector: Reflector, // Inject Reflector
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);
    const token = this.extractToken(request);

    if (!token) {
      this.logAndThrowUnauthorized('No token provided');
    }

    try {
      // Verifies the token and checks expiration internally
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });

      const user = {
        id: payload.sub,
        email: payload.email ?? null,
        role: payload.role ?? null,
      }

      // Attach user data to request object
      request.user = user;

      // Check if the role is required by the route
      const requiredRoles = this.reflector.get<UserRoleEnum[]>(ROLES_KEY, context.getHandler());
      if (requiredRoles && requiredRoles.length > 0) {
        this.checkRole(user.role, requiredRoles);
      }

    } catch (error) {
      this.logAndThrowUnauthorized('Invalid token', error.message);
    }

    return true;
  }

  /**
   * Check if the user's role matches one of the required roles.
   * Throws a ForbiddenException if the role does not match.
   */
  private checkRole(userRole: UserRoleEnum | null, requiredRoles: UserRoleEnum[]): void {
    if (!userRole || !requiredRoles.includes(userRole)) {
      this.logger.warn(`User with role ${userRole} is not authorized for this route.`);
      throw new ForbiddenException('You do not have access to this resource');
    }
  }

  private extractToken(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer') {
        return token;
      }
    }
    return request.cookies?.token;
  }

  private getRequest(context: ExecutionContext): Request {
    return context.switchToHttp().getRequest();
  }

  private logAndThrowUnauthorized(message: string, errorDetails?: string): never {
    this.logger.error(`${message}. ${errorDetails ?? ''}`);
    throw new UnauthorizedException(message);
  }
}
