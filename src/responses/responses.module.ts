import { Module } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { ResponsesController } from './responses.controller';

@Module({
  providers: [ResponsesService],
  controllers: [ResponsesController]
})
export class ResponsesModule {}
