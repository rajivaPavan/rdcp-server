import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UserSchema } from './user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from 'src/utilities/email/email.module';
import { OtpService } from 'src/utilities/otp/otp.service';
import { OTPModule } from 'src/utilities/otp/otp.module';
import { CryptService } from 'src/utilities/crypt/crypt.service';
import { CryptModule } from 'src/utilities/crypt/crypt.module';

@Module({
    imports:[
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        EmailModule,
        OTPModule,
        CryptModule
    ],
    controllers: [UserController],
    providers: [UserService, UserRepository],
    exports: [UserService],
})
export class UserModule {}