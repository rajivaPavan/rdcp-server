import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { FormsModule } from './forms/forms.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
      }),
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
    ProjectsModule,
    FormsModule,
  ],
})
export class AppModule {}
