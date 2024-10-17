import { Module } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { ResponsesController } from './responses.controller';
import { S3ObjectStorageService } from './files.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Response, ResponseSchema } from './entities/response.schema';
import { ResponsesRepository } from './responses.repository';
import { AuthModule } from 'src/auth/auth.module';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { S3ObjectStorageService } from './files.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FormResponse, ResponseSchema } from './entities/response.schema';
import { ResponsesRepository } from './responses.repository';
import { AuthModule } from 'src/auth/auth.module';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { FormsModule } from 'src/forms/forms.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Response.name, schema: ResponseSchema }]),
    AuthModule,
    AuthorizationModule
  ],
  providers: [
    ResponsesService,
    ResponsesRepository,
    S3ObjectStorageService
  ],
  controllers: [ResponsesController],
})
export class ResponsesModule {}