import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './entities/project.schema';
import { ProjectRepository } from './projects.repository';
import { ConfigModule } from '@nestjs/config';
import { CollaboratorsRepository } from './collaborators.repository';
import { UsersModule } from 'src/users/users.module';
import { jwtModule } from '../auth/auth.module';
import { FormsModule } from '../forms/forms.module';
import {
  Collaborator,
  CollaboratorSchema,
} from './entities/collaborator.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Collaborator.name, schema: CollaboratorSchema },
    ]),
    jwtModule,
    FormsModule,
    UsersModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectRepository, CollaboratorsRepository],
})
export class ProjectsModule {}
