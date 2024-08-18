import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Collaborator, CollaboratorSchema, Project, ProjectSchema } from './projects.schema';
import { ProjectRepository } from './projects.repository';
import { ConfigModule } from '@nestjs/config';
import { CollaboratorRepository } from './collaborator.repository';
import { jwtModule } from '../auth/auth.module';

@Module({
    imports: [
        ConfigModule,
        MongooseModule.forFeature([
            { name: Project.name, schema: ProjectSchema },
            { name: Collaborator.name, schema: CollaboratorSchema }
        ]),
        jwtModule
    ],
    controllers: [ProjectsController],
    providers: [ProjectsService, ProjectRepository, CollaboratorRepository]
})
export class ProjectsModule { }
