import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UserSchema } from './user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailService } from '../../utitlies/email/email.service';
import { OtpService } from 'src/utitlies/otp/otp.service';
import { CacheModule } from '@nestjs/cache-manager';
import { OTPModule } from 'src/utitlies/otp/otp.module';

@Module({
    imports:[
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        OTPModule,
    ],
    controllers: [UserController],
    providers: [UserService, UserRepository, EmailService, OtpService],
    exports: [UserService],
})
export class UserModule {}