import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.schema';
import { UserRoleEnum } from './entities/user-role.enum';
import { CryptService } from 'src/utilities/crypt/crypt.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeedService {

    static readonly testAdmin = {
        email: 'admin@rdcp.com',
        password: 'admin123'
    };

    static readonly testUsers = [
        {
            email: 'user1@rdcp.com',
            password: 'user123'
        },
        {
            email: 'user2@rdcp.com',
            password: 'user123'
        },
        {
            email: 'user3@rdcp.com',
            password: 'user123'
        },
        {
            email: 'user4@rdcp.com',
            password: 'user123'
        },
        {
            email: 'user5@rdcp.com',
            password: 'user123'
        }
    ]

    constructor(
        private readonly configService: ConfigService,
        private readonly cryptService: CryptService,
        @InjectModel(User.name) private readonly userModel: Model<User>,
    ) {}

    /**
     * Initializes the admin user by retrieving the admin email and password from the environment variables.
     * Throws an error if the admin email or password is not found in the environment variables.
     *
     * @throws {Error} If the admin email or password is not found in the environment variables.
     * @returns {Promise<void>} A promise that resolves when the admin user is initialized.
     */
    async initAdmin(): Promise<void> {
        // Get specified admin email and password from .env
        const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
        const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

        if (!adminEmail || !adminPassword) {
            throw new Error('Admin email and password not found in .env');
        }
    }

    /**
     * Initializes test users by adding a test admin and multiple test users.
     * 
     * This method performs the following actions:
     * - Adds a test admin user with predefined email and password.
     * - Adds multiple test users concurrently using Promise.all.
     * 
     * @returns {Promise<void>} A promise that resolves when all test users have been added.
     */
    async initTestUsers(): Promise<void> {
        // add test admin
        await this.addUser(SeedService.testAdmin.email, SeedService.testAdmin.password, 'Test Admin', UserRoleEnum.ADMIN);

        // add all test users, promise all
        await Promise.all(SeedService.testUsers.map(async (user) => {
            await this.addUser(user.email, user.password, 'Test User', UserRoleEnum.USER);
        }));
    }

    private async addUser(
        email: string,
        password: string,
        name: string,
        role: UserRoleEnum,
    ): Promise<void> {
        const user = await this.userModel.findOne({ email });

        if (!user) {
            const hashedPassword = await this.cryptService.hashPassword(password);

            try {
                const user =  await this.userModel.create({
                    name,
                    email,
                    password: hashedPassword,
                    role,
                });

                await user.save();
            } catch (err) {
                console.error(`Error seeding user ${email}: ${err.message}`);
            }
        }
    }
}
