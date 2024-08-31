import { Module } from '@nestjs/common';
import { SessionStore } from './session.service';

@Module({
  providers: [SessionStore],
})
export class SessionModule {}
