import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from './redis/redis.module';
import { CoreModule } from './core.module';

export const dbModule = MongooseModule.forRootAsync({
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => ({
    uri: config.get<string>('MONGODB_URI'), // Loaded from .env
    dbName: config.get<string>('MONGODB_DB_NAME') || 'rdcp_db',
  }),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    dbModule,
    RedisModule,
    CoreModule
  ]
})
export class AppModule { }
