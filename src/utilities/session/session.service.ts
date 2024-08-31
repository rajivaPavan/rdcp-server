import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionStore {
  private readonly sessions: Map<string, any> = new Map();

  createSession(sessionData: any) {
    // create a session id - uuid
    const sessionId = Math.random().toString(36).substring(7);
    this.sessions.set(sessionId, sessionData);
  }

  getSession(sessionId: string): any {
    return this.sessions.get(sessionId);
  }

  deleteSession(sessionId: string) {
    this.sessions.delete(sessionId);
  }
}
