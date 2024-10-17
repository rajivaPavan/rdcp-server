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
import { CollaboratorsRepository } from 'src/projects/collaborators.repository';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/decorators/user.decorator';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Form.name, schema: FormSchema }]),
    AuthorizationModule,
    UsersModule,
    forwardRef(() => ProjectsModule),
  ],
  controllers: [FormsController],
  providers: [
    FormsService,
    FormsEditingService,
    FormAuthorizationGuard,
    FormsRepository,],
  exports: [FormsService],
})
export class FormsModule { }
