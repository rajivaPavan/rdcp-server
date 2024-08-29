import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { OTPModule } from './utilities/otp/otp.module';
import { FormsModule } from './forms/forms.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'), // Loaded from .ENV
        dbName: 'rdcp_db',
      }),
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }),
    OTPModule,
    UsersModule,
    AuthModule,
    ProjectsModule,
    FormsModule,
  ],
})
export class AppModule {}
