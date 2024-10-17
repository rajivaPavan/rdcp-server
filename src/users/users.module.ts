import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { User, UserSchema } from './entities/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { OTPModule } from 'src/utilities/otp/otp.module';
import { CryptModule } from 'src/utilities/crypt/crypt.module';
import { SeedService } from './seed';
import { WhitelistedDomain, WhitelistedDomainSchema } from './entities/whitelisted-domain.schema';
import { DomainsRepository } from './domains.repository';
import { DomainsAdminService } from './admin.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: WhitelistedDomain.name, schema: WhitelistedDomainSchema }
    ]),
    OTPModule,
    CryptModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, DomainsAdminService, DomainsRepository, SeedService],
  exports: [UsersService, UsersRepository, SeedService],
})
export class UsersModule { }
