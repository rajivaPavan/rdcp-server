import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { RoleEnum } from '../user/user.schema';
import { CryptService } from '../utilities/crypt/crypt.service';
import { InvalidCredentialsException } from './auth.exceptions';

describe('AuthenticatonService', () => {
    let service: AuthenticationService;
    let userService: UserService;
    let jwtService: JwtService;
    let cryptService: CryptService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthenticationService,
                {
                    provide: UserService,
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
                }
            ],
        }).compile();

        service = module.get<AuthenticationService>(AuthenticationService);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
        cryptService = module.get<CryptService>(CryptService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return access token for valid credentials', async () => {
        const email = 'valid@rdcp.com'
        const password = 'testpassword';
        const user = {
            email: email,
            name: 'Valid User',
            role: RoleEnum.USER,
            password: password,
            _id: new Types.ObjectId()
        };
        const token = 'testtoken';

        jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user);
        jest.spyOn(jwtService, 'sign').mockReturnValue(token);
        jest.spyOn(cryptService, 'comparePassword').mockResolvedValue(true);

        const result = await service.login(email, password);

        expect(result).toEqual({
            email: user.email,
            role: user.role,
            jwt: token
        });
    });

    it("should throw InvalidCredentialsException for valid email, invalid password", async () => {
        const email = 'valid@rdcp.com';
        const password = 'wrongpassword';
        const user = {
            email: email,
            name: 'Valid User',
            role: RoleEnum.USER,
            password: 'hashedpassword',
            _id: new Types.ObjectId()
        };

        jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user);
        jest.spyOn(cryptService, 'comparePassword').mockResolvedValue(false); // Password mismatch

        await expect(service.login(email, password)).rejects.toThrow(InvalidCredentialsException);
    });

    it("should throw InvalidCredentialsException for non-existent user", async () => {
        const email = 'nonexistent@rdcp.com';
        const password = 'somepassword';

        jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);

        await expect(service.login(email, password)).rejects.toThrow(InvalidCredentialsException);
    });


});