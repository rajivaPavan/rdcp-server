import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UserSchema } from './user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from 'src/utitlies/email/email.module';
import { OtpService } from 'src/utitlies/otp/otp.service';
import { OTPModule } from 'src/utitlies/otp/otp.module';

@Module({
    imports:[
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        EmailModule,
        OTPModule
    ],
    controllers: [UserController],
    providers: [UserService, UserRepository],
    exports: [UserService],
})
export class UserModule {}