import { forwardRef, Module } from '@nestjs/common';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';
import { FormsRepository } from './forms.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Form, FormSchema } from './entities/form.schema';
import { ConfigModule } from '@nestjs/config';
import { FormsEditingService } from './form-editing.service';
import { FormAuthorizationGuard } from './forms.guard';
import { ProjectsService } from 'src/projects/projects.service';
import { ProjectsModule } from 'src/projects/projects.module';
import { AuthorizationModule } from 'src/authorization/authorization.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Form.name, schema: FormSchema }]),
    AuthorizationModule
  ],
  controllers: [FormsController],
  providers: [
    FormsService,
    FormsEditingService,
    FormAuthorizationGuard,
    FormsRepository],
  exports: [FormsService, FormsRepository],
})
export class FormsModule { }
