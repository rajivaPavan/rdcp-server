import { Module } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { ResponsesController } from './responses.controller';
import { S3ObjectStorageService } from './files.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Response, ResponseSchema } from './entities/response.schema';
import { ResponsesRepository } from './responses.repository';
import { FormsModule } from 'src/forms/forms.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Response.name, schema: ResponseSchema }]),
    AuthModule,
    FormsModule
  ],
  providers: [
    ResponsesService,
    ResponsesRepository,
    S3ObjectStorageService
  ],
  controllers: [ResponsesController],
})
export class ResponsesModule {}