import { Injectable } from '@nestjs/common';

export const AppServiceInterface = 'IAppService';
export interface IAppService {
  getHello(): string;
}

@Injectable()
export class AppService implements IAppService {
  getHello(): string {
    return 'Hello World!';
  }
}
