import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { CacheModule } from '@nestjs/cache-manager';
import type { RedisClientOptions } from 'redis';
import { OtpService } from './utilities/otp/otp.service';
import * as redisStore from 'cache-manager-redis-store';
import { OTPModule } from './utilities/otp/otp.module';
import { FormsModule } from './modules/forms/forms.module';

// read the URI from the environment variable
const uri = process.env.MONGODB_URI;

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'), // Loaded from .ENV
        dbName: 'rdcp_db'
      })
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }),
    OTPModule,
    UserModule,
    AuthModule,
    ProjectsModule,
    FormsModule
  ]
})
export class AppModule { }