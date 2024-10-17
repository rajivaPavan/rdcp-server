import { forwardRef, Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './entities/project.schema';
import { ProjectRepository } from './projects.repository';
import { ConfigModule } from '@nestjs/config';
import { CollaboratorsRepository } from './collaborators.repository';
import { UsersModule } from 'src/users/users.module';
import { FormsModule } from '../forms/forms.module';
import {
  Collaborator,
  CollaboratorSchema,
} from './entities/collaborator.schema';
import { CollaboratorsController } from './collaborators.controller';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Collaborator.name, schema: CollaboratorSchema },
    ]),
    FormsModule,
    UsersModule,
  ],
  controllers: [ProjectsController, CollaboratorsController],
  providers: [ProjectsService, ProjectRepository, CollaboratorsRepository],
  exports: [CollaboratorsRepository],
})
export class ProjectsModule {}
