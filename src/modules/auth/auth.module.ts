import { Module } from '@nestjs/common';
import { AuthenticationController } from './auth.controller';
import { AuthenticationService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CryptService } from '../../utitlies/crypt/crypt.service';

@Module({
    imports: [
        ConfigModule,
        UserModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                global: true,
                secret: config.get('JWT_SECRET'),
                signOptions: {
                    expiresIn: '1d',
                },
            })
        }),
    ],
    controllers: [AuthenticationController],
    providers: [AuthenticationService, CryptService, ConfigService],
})
export class AuthModule { }