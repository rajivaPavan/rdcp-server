// cache.config.ts
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

export const createCacheConfig = (configService: ConfigService) => {
  const isProd = configService.get<string>('NODE_ENV') === 'production';

  const cacheConfig: any = {
    isGlobal: true,
    store: redisStore,
    host: configService.get<string>('REDIS_HOST'),
    port: configService.get<number>('REDIS_PORT') || 6379,
  };

  // Add password and TLS only in production
  if (isProd) {
    cacheConfig.tls = configService.get<string>('REDIS_TLS') == 'true';
    cacheConfig.password = configService.get<string>('REDIS_PASSWORD');
  }
  return cacheConfig;
};
