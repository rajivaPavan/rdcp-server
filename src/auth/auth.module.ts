import { Module } from '@nestjs/common';
import { AuthenticationController } from './auth.controller';
import { AuthenticationService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CryptModule } from 'src/utilities/crypt/crypt.module';

@Module({
  imports: [UsersModule, CryptModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
})
export class AuthModule {}
