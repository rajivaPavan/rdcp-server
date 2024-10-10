import { OtpService } from "src/utilities/otp/otp.service";
import { UsersRepository } from "./users.repository";
import { UsersService } from "./users.service";
import { CryptService } from "src/utilities/crypt/crypt.service";
import { TypedEventEmitter } from "src/event-emitter/typed-event-emitter.class";
import { Test } from "@nestjs/testing";
import { User } from "./entities/user.schema";
import { AddUserDTO } from "./dtos/add-user.dto";

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: UsersRepository;
  let otpService: OtpService;
  let cryptService: CryptService;
  let eventEmitter: TypedEventEmitter;

beforeEach(async () => {
    const module = await Test.createTestingModule({
        providers: [
            UsersService,
            {
                provide: UsersRepository,
                useValue: {
                    findAll: jest.fn(),
                    findUserByEmail: jest.fn(),
                    searchByEmail: jest.fn(),
                    findById: jest.fn(),
                    create: jest.fn(),
                    update: jest.fn(),
                },
            },
            {
                provide: OtpService,
                useValue: {
                    sendOtp: jest.fn(),
                    verifyOtp: jest.fn(),
                },
            },
            {
                provide: CryptService,
                useValue: {
                    hashPassword: jest.fn(),
                    comparePassword: jest.fn(),
                },
            },
            {
                provide: TypedEventEmitter,
                useValue: {
                    emit: jest.fn(),
                },
            },
        ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
    otpService = module.get<OtpService>(OtpService);
    cryptService = module.get<CryptService>(CryptService);
    eventEmitter = module.get<TypedEventEmitter>(TypedEventEmitter);
});

  describe('addUsers', () => {
    it('should add multiple users and return success count and failed users', async () => {
      const users: AddUserDTO[] = [
        { email: 'test1@example.com', name: 'Test User 1' },
        { email: 'test2@example.com', name: 'Test User 2' },
      ];
      jest.spyOn(usersService, 'addUser').mockImplementation(async (user) => {
        if (user.email === 'test2@example.com') throw new Error();
      });

      const result = await usersService.addUsers({ users });

      expect(result.successCount).toBe(1);
      expect(result.failedUsers).toEqual([users[1]]);
    });
  });

});