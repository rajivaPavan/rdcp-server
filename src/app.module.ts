import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { CacheModule } from '@nestjs/cache-manager';
import { FormsModule } from './forms/forms.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypedEventEmitterModule } from './event-emitter/type-event-emitter.module';
import { JwtModule } from '@nestjs/jwt';
import { ResponsesModule } from './responses/responses.module';
import { EmailModule } from './email/email.module';
import { createCacheConfig } from './redis/cache.config';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    TypedEventEmitterModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'), // Loaded from .env
        dbName: 'rdcp_db',
      }),
    }),
    RedisModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
    }),
    EmailModule,
    UsersModule,
    AuthModule,
    ProjectsModule,
    FormsModule,
    ResponsesModule
  ]
})
export class AppModule { }
