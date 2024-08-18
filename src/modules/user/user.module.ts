import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UserSchema } from './user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from 'src/utitlies/email/email.module';

@Module({
    imports:[
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        EmailModule
    ],
    controllers: [UserController],
    providers: [UserService, UserRepository],
    exports: [UserService],
})
export class UserModule {}