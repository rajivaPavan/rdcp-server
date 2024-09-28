import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { TypedEventEmitter } from '../../event-emitter/typed-event-emitter.class';
import { User } from 'src/users/entities/user.schema';

@Injectable()
export class OtpService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly eventEmitter: TypedEventEmitter,
  ) {}

  private readonly otpTtlInSeconds = 300; // 5 minutes
  private getOTPTTLInMinutes() {
    return this.otpTtlInSeconds / 60;
  }

  async sendOTP(user: User) {
    const otp = this.generateOTP();
    // save otp to the cache
    await this.saveOTPToCache(user.email, otp);

    this.eventEmitter.emit('user.password-reset', {
      email: user.email,
      name: user.name,
      otp: otp.toString(),
      otpExpiry: this.getOTPTTLInMinutes(),
    });
  }

  private generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  private async saveOTPToCache(email: string, otp: number) {
    // save otp to the cache
    await this.cacheManager.set(email, otp.toString(), this.otpTtlInSeconds);
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
