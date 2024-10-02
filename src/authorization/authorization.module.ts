import { Module } from '@nestjs/common';
import { ProjectAuthorization } from './projects.authorization';
import { ProjectsService } from 'src/projects/projects.service';
import { ProjectRepository } from 'src/projects/projects.repository';
import { CollaboratorsRepository } from 'src/projects/collaborators.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Collaborator, CollaboratorSchema } from 'src/projects/entities/collaborator.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Collaborator.name, schema: CollaboratorSchema },
        ]),
    ],
    providers: [
        CollaboratorsRepository,
        ProjectAuthorization
    ],
    exports: [
        ProjectAuthorization
    ]
})
export class AuthorizationModule { }
