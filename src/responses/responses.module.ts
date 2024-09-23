import { Module } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { ResponsesController } from './responses.controller';
import { S3ObjectStorageService } from './files.service';

@Module({
  providers: [ResponsesService, S3ObjectStorageService],
  controllers: [ResponsesController]
})
export class ResponsesModule {}
