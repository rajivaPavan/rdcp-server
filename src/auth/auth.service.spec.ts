import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { CryptService } from '../utilities/crypt/crypt.service';
import { InvalidCredentialsException } from './exceptions/invalid-credentials.exception';
import { InvalidRefreshToken } from './exceptions/invalid-refresh-token.exception';
import { UserRoleEnum } from '../users/entities/user-role.enum';
import { ConfigService } from '@nestjs/config';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let jwtService: JwtService;
  let cryptService: CryptService;
  let config: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: UsersService,
          useValue: {
            findUserByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: CryptService,
          useValue: {
            comparePassword: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          }
        }
      ],
    }).compile();

    service = module.get(AuthenticationService);
    jwtService = module.get(JwtService);
    cryptService = module.get(CryptService);
    config = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /// v1 login tests

  it('should return access token for valid credentials', async () => {
    const password = 'testpassword';
    const user = {
      email: 'valid@rdcp.com',
      name: 'Valid User',
      role: UserRoleEnum.USER,
      password: password,
      _id: new Types.ObjectId(),
    };
    const token = 'testtoken';

    jest.spyOn(jwtService, 'sign').mockReturnValue(token);
    jest.spyOn(cryptService, 'comparePassword').mockResolvedValue(true);

    const result = await service.login(user, password);

    expect(result).toEqual({
      email: user.email,
      role: user.role,
      jwt: token,
    });
  });

  it('should throw InvalidCredentialsException for valid email, invalid password', async () => {
    const password = 'wrongpassword';
    const user = {
      email: 'valid@rdcp.com',
      name: 'Valid User',
      role: UserRoleEnum.USER,
      password: 'hashedpassword',
      _id: new Types.ObjectId(),
    };

    jest.spyOn(cryptService, 'comparePassword').mockResolvedValue(false); // Password mismatch

    await expect(service.login(user, password)).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it('should throw InvalidCredentialsException for non-existent user', async () => {
    const password = 'somepassword';
    await expect(service.login(null, password)).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  // END of v1 login tests

  // refresh tests

  it('should return a new access token for a valid refresh token', async () => {
    const refreshToken = 'validRefreshToken';
    const payload = {
      email: 'valid@rdcp.com',
      sub: new Types.ObjectId(),
      role: UserRoleEnum.USER,
    };
    const newAccessToken = 'newAccessToken';

    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);
    jest.spyOn(service, 'createToken').mockReturnValue(newAccessToken);

    const result = await service.refresh(refreshToken);

    expect(result).toEqual({
      accessToken: newAccessToken,
    });
  });

  it('should throw InvalidRefreshTokenException if refresh token is missing', async () => {
    await expect(service.refresh('')).rejects.toThrow(
      InvalidRefreshToken.withMessage('Refresh token is required'),
    );
  });

  it('should throw InvalidRefreshTokenException for an invalid refresh token', async () => {
    const refreshToken = 'invalidRefreshToken';

    jest.spyOn(jwtService, 'verifyAsync').mockImplementation(() => {
      throw new InvalidRefreshToken();
    });

    await expect(service.refresh(refreshToken)).rejects.toThrow(
      InvalidRefreshToken,
    );
  });

  // v2 login tests below

  it('should return access and refresh tokens for valid credentials in loginV2', async () => {
    const password = 'testpassword';
    const user = {
      email: 'valid@rdcp.com',
      name: 'Valid User',
      role: UserRoleEnum.USER,
      password: password,
      _id: new Types.ObjectId(),
    };
    const accessToken = 'accessToken';
    const refreshToken = 'refreshToken';

    jest.spyOn(service, 'createToken').mockReturnValueOnce(accessToken).mockReturnValueOnce(refreshToken);
    jest.spyOn(cryptService, 'comparePassword').mockResolvedValue(true);

    const result = await service.loginV2(user, password);

    expect(result).toEqual({
      email: user.email,
      role: user.role,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  });

  it('should throw InvalidCredentialsException for valid email, invalid password in loginV2', async () => {
    const password = 'wrongpassword';
    const user = {
      email: 'valid@rdcp.com',
      name: 'Valid User',
      role: UserRoleEnum.USER,
      password: 'hashedpassword',
      _id: new Types.ObjectId(),
    };

    jest.spyOn(cryptService, 'comparePassword').mockResolvedValue(false); // Password mismatch

    await expect(service.loginV2(user, password)).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it('should throw InvalidCredentialsException for non-existent user in loginV2', async () => {
    const password = 'somepassword';
    await expect(service.loginV2(null, password)).rejects.toThrow(
      InvalidCredentialsException,
    );
  });
});
