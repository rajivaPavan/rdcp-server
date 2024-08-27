import { Module } from '@nestjs/common';
import { AuthenticationController } from './auth.controller';
import { AuthenticationService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CryptService } from '../utilities/crypt/crypt.service';
import { CryptModule } from 'src/utilities/crypt/crypt.module';

export const jwtModule = JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => ({
        global: true,
        secret: config.get('JWT_SECRET'),
        signOptions: {
            expiresIn: '1d',
        },
    })
});

@Module({
    imports: [
        ConfigModule,
        jwtModule,
        UserModule,
        CryptModule
    ],
    controllers: [AuthenticationController],
    providers: [AuthenticationService],
})
export class AuthModule { }