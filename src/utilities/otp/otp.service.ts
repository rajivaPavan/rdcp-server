import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { TypedEventEmitter } from '../../event-emitter/typed-event-emitter.class';

@Injectable()
export class OtpService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly eventEmitter: TypedEventEmitter,
  ) {}

  async sendOTP(email: string) {
    const otp = this.generateOTP();

    // save otp to the cache
    await this.saveOTPToCache(email, otp);

    // this.emailService.sendEmail(email, 'OTP', `Your OTP is ${otp}`);
    this.eventEmitter.emit('user.password-reset', { email, name:otp.toString(), link:otp.toString() });
  }

  private generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);
  }

  private async saveOTPToCache(email: string, otp: number) {
    // save otp to the cache
    const ttl = 60 * 5; // 5 minutes
    await this.cacheManager.set(email, otp.toString(), ttl);
  }

  async verifyOTP(email: string, otp: string) {
    // get otp from cache
    const cachedOTP = await this.cacheManager.get(email);
    const isOTPValid = cachedOTP === otp;
    if (isOTPValid) {
      // delete otp from cache
      await this.cacheManager.del(email);
      return true;
    }
    return false;
  }
}
