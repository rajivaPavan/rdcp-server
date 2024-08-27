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

        const form = new Form({
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
            id: createdForm._id.toString(),
            projectId: createdForm.projectId.toString(),
        };
    }

    async getForms(projectId: string, userId: string) {

        const forms = await this.formRepository.find({ projectId: new Types.ObjectId(projectId) });

        return forms.map(form => ({
            ...form,
            id: form._id.toString(),
            projectId: form.projectId.toString(),
        }));
    }

    async getForm(formId: string) {
        const form = await this.formRepository.findById(formId);

        return {
            ...form,
            id: form._id.toString(),
            projectId: form.projectId.toString(),
        };
    }

    async updateForm(formId: string, formDto: FormDTO) {

        // remove prop projectId from formDto
        const { projectId, ...form } = formDto;
        const updatedForm = await this.formRepository.update(formId, form);

        return {
            ...updatedForm,
            id: updatedForm._id.toString(),
            projectId: updatedForm.projectId.toString(),
        };
    }

    async deleteForm(formId: string) {
        return this.formRepository.delete(formId);
    }

}
