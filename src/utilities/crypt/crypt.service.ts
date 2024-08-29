import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptService {
  private readonly salt: string;

  constructor(private readonly config: ConfigService) {
    this.salt = this.config.get<string>('SALT');
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.salt);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
