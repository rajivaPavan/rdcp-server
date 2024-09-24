import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class FormsEditingService {
  constructor(private redisService: RedisService) {}

  // Lock the form for a user with TTL
  async lockForm(formId: string, userId: string) {
    const lockKey = `form-lock:${formId}`;
    const isLocked = await this.redisService.get(lockKey);

    if (isLocked) {
      throw new Error('Form is already being edited.');
    }

    await this.redisService.set(lockKey, userId, 300); // 5-minute TTL
    return { success: true };
  }

  // Extend the lock with heartbeat
  async keepAlive(formId: string, userId: string) {
    const lockKey = `form-lock:${formId}`;
    const currentEditor = await this.redisService.get(lockKey);

    if (currentEditor === userId) {
      await this.redisService.updateTTL(lockKey, 300); // Extend by 5 minutes
      return { success: true };
    }
    throw new Error('Cannot extend lock, no ownership.');
  }

  // Release the lock
  async releaseLock(formId: string, userId: string) {
    const lockKey = `form-lock:${formId}`;
    const currentEditor = await this.redisService.get(lockKey);

    if (currentEditor === userId) {
      await this.redisService.del(lockKey);
      return { success: true };
    }
    throw new Error('Cannot release lock, no ownership.');
  }

  // Get current lock status
  async getLockStatus(formId: string) {
    const lockKey = `form-lock:${formId}`;
    const currentEditor = await this.redisService.get(lockKey);
    return currentEditor;
  }
}
