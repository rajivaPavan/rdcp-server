import { Injectable } from '@nestjs/common';
import { FormDTO, ProjectFormsResponseDTO } from './forms.dto';
import { FormRepository } from './form.repository';
import { Form } from './form.schema';
import { Types } from 'mongoose';

@Injectable()
export class FormsService {

    constructor(
        private readonly formRepository: FormRepository
    ) { }

    async createForm(formDto: FormDTO, userId: any): Promise<FormDTO> {

        // check if user is authorized to create form 
        // ie. user is a owner or manager of the project

        const form  = new Form({
            _id: new Types.ObjectId(),
            name: formDto.name,
            description: formDto.description,
            projectId: new Types.ObjectId(formDto.projectId),
            isPrivate: true,
            isPublished: false,
            multipleResponses: true
        });

        const createdForm = await this.formRepository.create(form);

        return {
            ...createdForm,
            id: createdForm._id.toHexString(),
            projectId: createdForm.projectId.toHexString()
        };        
    }

    async getForms(projectId: string, userId: string): Promise<ProjectFormsResponseDTO> {
        // check if user is authorized to get forms
        // ie. user is a collaborator of the project

        const forms = await this.formRepository.find({ projectId: new Types.ObjectId(projectId) });

        return {
            forms: forms.map(form => ({
                ...form,
                id: form._id.toHexString(),
                projectId: form.projectId.toHexString()
            })),
            roles: []
        };
    }

}
