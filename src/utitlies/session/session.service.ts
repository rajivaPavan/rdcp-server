import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionStore {
    private readonly sessions: Map<string, any> = new Map();

    createSession(sessionId: string, sessionData: any) {
        this.sessions.set(sessionId, sessionData);
    }

    getSession(sessionId: string): any {
        return this.sessions.get(sessionId);
    }

    deleteSession(sessionId: string) {
        this.sessions.delete(sessionId);
    }
}
