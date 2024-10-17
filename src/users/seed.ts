import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.schema';
import { UserRoleEnum } from './entities/user-role.enum';
import { CryptService } from 'src/utilities/crypt/crypt.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeedService {
    constructor(
        private readonly configService: ConfigService,
        private readonly cryptService: CryptService,
        @InjectModel(User.name) private userModel: Model<User>) { }

    async initAdmin() {
        // get specified admin email and password from .env
        const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
        const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

        if(!adminEmail || !adminPassword) {
            throw new Error('Admin email and password not found in .env');
        }
        
        // check if admin already exists
        const admin = await this.userModel.findOne({ email: adminEmail });

        // if admin does not exist, create one
        if (!admin) {
            const hashedPassword = await this.cryptService.hashPassword(adminPassword);
            try {
                await this.userModel.create({
                    name: 'Super Admin',
                    email: adminEmail,
                    password: hashedPassword,
                    role: UserRoleEnum.ADMIN
                });
                console.log('Admin seeded successfully!');
            }
            catch (err) {
                console.log(`Error seeding admin ${adminEmail}: ${err}`);
            }
        }
        else {
            console.log('Admin already exists!');
        }
    }
}
