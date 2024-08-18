import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './projects.schema';
import { ProjectRepository } from './projects.repository';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    ],
    controllers: [ProjectsController],
    providers: [ProjectsService, ProjectRepository]
})
export class ProjectsModule { }
