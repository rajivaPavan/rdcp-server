import { Module } from '@nestjs/common';
import { FormsAuthorization } from './forms.authorization';
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
        FormsAuthorization
    ],
    exports: [
        FormsAuthorization
    ]
})
export class AuthorizationModule { }
