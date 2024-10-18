import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from './redis/redis.module';
import { CoreModule } from './core.module';
import { EmailModule } from './email/email.module';
import { JWTConfigFactory } from './config/jwt.config';

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
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory: async (config: ConfigService) => {
        const factory = new JWTConfigFactory(config);
        return factory.create();
      },
    }),
    EmailModule,
    RedisModule,
    CoreModule
  ]
})
export class AppModule { }
