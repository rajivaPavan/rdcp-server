import { Test, TestingModule } from '@nestjs/testing';
import { SessionStore } from './session.service';

describe('SessionService', () => {
  let service: SessionStore;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionStore],
    }).compile();

    service = module.get<SessionStore>(SessionStore);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
