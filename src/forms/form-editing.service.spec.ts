import { RedisService } from 'src/redis/redis.service';
import {
  FormsEditingService,
  NoLockOwnerhsipException,
} from './form-editing.service';

describe('FormsEditingService', () => {
  let formsEditingService: FormsEditingService;
  let redisService: RedisService;

  beforeEach(() => {
    redisService = {
      get: jest.fn(),
      set: jest.fn(),
      updateTTL: jest.fn(),
      del: jest.fn(),
    } as any;
    formsEditingService = new FormsEditingService(redisService);
  });

  describe('lockForm', () => {
    it('should lock the form if no other user has locked it', async () => {
      (redisService.get as jest.Mock).mockResolvedValue(null);
      (redisService.set as jest.Mock).mockResolvedValue(null);

      const result = await formsEditingService.lockForm('form1', {
        id: 'user1',
        email: 'user1@example.com',
      });

      expect(redisService.get).toHaveBeenCalledWith('form-lock:form1');
      expect(redisService.set).toHaveBeenCalledWith(
        'form-lock:form1',
        { id: 'user1', email: 'user1@example.com' },
        300,
      );
      expect(result).toEqual({ success: true });
    });

    it('should not lock the form if another user has locked it', async () => {
      (redisService.get as jest.Mock).mockResolvedValue({
        id: 'user2',
        email: 'user2@example.com',
      });

      const result = await formsEditingService.lockForm('form1', {
        id: 'user1',
        email: 'user1@example.com',
      });

      expect(redisService.get).toHaveBeenCalledWith('form-lock:form1');
      expect(result).toEqual({ success: false, user: 'user2@example.com' });
    });
  });

  describe('keepAlive', () => {
    it('should extend the lock if the same user owns it', async () => {
      (redisService.get as jest.Mock).mockResolvedValue({
        id: 'user1',
        email: 'user1@example.com',
      });
      (redisService.updateTTL as jest.Mock).mockResolvedValue(null);

      const result = await formsEditingService.keepAlive('form1', 'user1');

      expect(redisService.get).toHaveBeenCalledWith('form-lock:form1');
      expect(redisService.updateTTL).toHaveBeenCalledWith(
        'form-lock:form1',
        300,
      );
      expect(result).toEqual({ success: true });
    });

    it('should throw an error if another user owns the lock', async () => {
      (redisService.get as jest.Mock).mockResolvedValue({
        id: 'user2',
        email: 'user2@example.com',
      });

      await expect(
        formsEditingService.keepAlive('form1', 'user1'),
      ).rejects.toThrow(NoLockOwnerhsipException);
    });
  });

  describe('releaseLock', () => {
    it('should release the lock if the same user owns it', async () => {
      (redisService.get as jest.Mock).mockResolvedValue({
        id: 'user1',
        email: 'user1@example.com',
      });
      (redisService.del as jest.Mock).mockResolvedValue(null);

      const result = await formsEditingService.releaseLock('form1', 'user1');

      expect(redisService.get).toHaveBeenCalledWith('form-lock:form1');
      expect(redisService.del).toHaveBeenCalledWith('form-lock:form1');
      expect(result).toEqual({ success: true });
    });

    it('should throw an error if another user owns the lock', async () => {
      (redisService.get as jest.Mock).mockResolvedValue({
        id: 'user2',
        email: 'user2@example.com',
      });

      await expect(
        formsEditingService.releaseLock('form1', 'user1'),
      ).rejects.toThrow(NoLockOwnerhsipException);
    });
  });

  describe('getLockStatus', () => {
    it('should return the current lock status', async () => {
      const currentEditor = { id: 'user1', email: 'user1@example.com' };
      (redisService.get as jest.Mock).mockResolvedValue(currentEditor);

      const result = await formsEditingService.getCurrentEditor('form1');

      expect(redisService.get).toHaveBeenCalledWith('form-lock:form1');
      expect(result).toEqual(currentEditor);
    });
  });
});
