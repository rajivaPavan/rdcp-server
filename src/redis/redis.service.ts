import { Global, Inject, Injectable } from "@nestjs/common";
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class RedisService {

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }
    
    /// Updates the time to live of a key
    /// @param lockKey: string
    /// @param ttl: number - time to live in seconds
    async updateTTL(lockKey: string, ttl: number) {
        // get the current value of the key
        const value = await this.cacheManager.get(lockKey);
        // set the key with the current value and the new ttl
        this.cacheManager.set(lockKey, value, ttl);
    }

    /// Set a key value pair in the cache
    /// @param key: string
    /// @param value: any
    /// @param ttl: number | undefined - time to live in seconds
    async set(key: string, value: any, ttl: number | undefined) {
        await this.cacheManager.set(key, value, ttl * 1000);
    }


    /// Get the value of a key
    async get(key: string) {
        return await this.cacheManager.get(key);
    }

    /// Delete a key from the cache
    async del(key: string) {
        await this.cacheManager.del(key);
    }
}