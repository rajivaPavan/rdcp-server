import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { CacheModule } from '@nestjs/cache-manager';
import { FormsModule } from './forms/forms.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypedEventEmitterModule } from './common/event-emitter/type-event-emitter.module';
import { JwtModule } from '@nestjs/jwt';
import { ResponsesModule } from './responses/responses.module';
import { EmailModule } from './email/email.module';
import { RedisModule } from './redis/redis.module';
import { AuthorizationModule } from './authorization/authorization.module';

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
        dbName: config.get<string>('MONGODB_DB_NAME') || 'rdcp_db', // Loaded from .env
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
    AuthorizationModule,
    EmailModule,
    UsersModule,
    AuthModule,
    ProjectsModule,
    FormsModule,
    ResponsesModule
  ]
})
export class AppModule { }
