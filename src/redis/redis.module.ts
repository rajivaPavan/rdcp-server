import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { createCacheConfig } from './cache.config';

@Global()
@Module({
    imports: [
        CacheModule.registerAsync({
            inject: [ConfigService],
            useFactory: createCacheConfig,
            isGlobal: true,
        }),
    ],
    providers: [
        RedisService,
    ],
    exports: [RedisService],
})
export class RedisModule { }

// Mock RedisModule
@Global()
@Module({
    imports: [
        CacheModule.registerAsync({
            isGlobal:true,
            useFactory: () => ({
                store: 'memory',
            })
        })
    ],
    providers: [
        RedisService,
    ],
    exports: [RedisService],
})
export class MockRedisModule { }
