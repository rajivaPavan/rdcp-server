import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class FormsEditingService {
  constructor(private redisService: RedisService) {}

  // Lock the form for a user with TTL
  async lockForm(formId: string, user: { id: string; email: string }) {
    const currentUser = await this.getCurrentEditor(formId);
    if (currentUser && currentUser.id !== user.id) {
      return {
        success: false,
        user: currentUser.email,
      };
    }

    const lockKey = this.makeLockKey(formId);
    await this.redisService.set(lockKey, user, 300); // 5-minute TTL
    return { success: true };
  }

  // Extend the lock with heartbeat
  async keepAlive(formId: string, userId: string) {
    const currentEditor = await this.getCurrentEditor(formId);
    if (currentEditor.id === userId) {
      const lockKey = this.makeLockKey(formId);
      await this.redisService.updateTTL(lockKey, 300); // Extend by 5 minutes
      return { success: true };
    }
    throw new Error('Cannot extend lock, no ownership.');
  }

  // Release the lock
  async releaseLock(formId: string, userId: string) {
    const currentEditor = await this.getCurrentEditor(formId);
    if (currentEditor.id === userId) {
      await this.removeCurrentEditor(formId);
      return { success: true };
    }
    throw new Error('Cannot release lock, no ownership.');
  }

  private async removeCurrentEditor(formId: string) {
    const lockKey = this.makeLockKey(formId);
    await this.redisService.del(lockKey);
  }

  // Get current lock status
  async getCurrentEditor(
    formId: string,
  ): Promise<{ id: string; email: string }> {
    const lockKey = this.makeLockKey(formId);
    const currentEditor = (await this.redisService.get(lockKey)) as {
      id: string;
      email: string;
    };
    return currentEditor;
  }

  private makeLockKey(formId: string) {
    return `form-lock:${formId}`;
  }
}
