import { Module } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { ResponsesController } from './responses.controller';
import { S3ObjectStorageService } from './files.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FormResponse, ResponseSchema } from './entities/response.schema';
import { ResponsesRepository } from './responses.repository';
import { AuthModule } from 'src/auth/auth.module';
import { FormsModule } from 'src/forms/forms.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FormResponse.name, schema: ResponseSchema }]),
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