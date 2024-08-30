import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { CryptService } from '../utilities/crypt/crypt.service';
import { InvalidCredentialsException } from './exceptions/invalid-credentials.exception';
import { UserRoleEnum } from '../users/entities/user-role.enum';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let jwtService: JwtService;
  let cryptService: CryptService;

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
          },
        },
        {
          provide: CryptService,
          useValue: {
            comparePassword: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AuthenticationService);
    jwtService = module.get(JwtService);
    cryptService = module.get(CryptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return access token for valid credentials', async () => {
    const email = 'valid@rdcp.com';
    const password = 'testpassword';
    const user = {
      email: email,
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
    const email = 'valid@rdcp.com';
    const password = 'wrongpassword';
    const user = {
      email: email,
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
});
