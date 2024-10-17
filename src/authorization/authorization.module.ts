import { Global, Module } from '@nestjs/common';
import { ProjectAuthorization } from './projects.authorization';
import { CollaboratorsRepository } from 'src/projects/collaborators.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Collaborator, CollaboratorSchema } from 'src/projects/entities/collaborator.schema';
import { FormsRepository } from 'src/forms/forms.repository';
import { FormAuthorization } from './forms.authorization';
import { Form, FormSchema } from 'src/forms/entities/form.schema';

@Global()
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Collaborator.name, schema: CollaboratorSchema },
            { name: Form.name, schema: FormSchema },
        ]),
    ],
    providers: [
        CollaboratorsRepository,
        FormsRepository,
        ProjectAuthorization,
        FormAuthorization,
    ],
    exports: [
        ProjectAuthorization,
        FormAuthorization
    ]
})
export class AuthorizationModule {}
