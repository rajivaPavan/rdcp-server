import { Module } from '@nestjs/common';
import { CryptModule } from 'src/utilities/crypt/crypt.module';
import { UsersModule } from '../users/users.module';
import { AuthenticationController } from './auth.controller';
import { AuthenticationService } from './auth.service';

@Module({
  imports: [UsersModule, CryptModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthModule {}
