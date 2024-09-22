import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { FormsModule } from './forms/forms.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypedEventEmitterModule } from './event-emitter/type-event-emitter.module';
import { JwtModule } from '@nestjs/jwt';

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
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        isGlobal: true, // Global cache configuration
        store: redisStore,
        host: configService.get<string>('REDIS_HOST'), // Loaded from .env
        port: configService.get<number>('REDIS_PORT') || 6379, // Default to 6379 if not set
        password: configService.get<string>('REDIS_PASSWORD'), // Loaded from .env
        tls: configService.get<boolean>('REDIS_TLS') || false, // Default to false if not set
      }),
      isGlobal: true,
    }),
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
    UsersModule,
    AuthModule,
    ProjectsModule,
    FormsModule,
  ],
})
export class AppModule { }
