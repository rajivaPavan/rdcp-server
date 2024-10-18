import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFormDTO, FormDTO, ParticipantsDTO } from './dtos/form.dto';
import { FormsRepository } from './forms.repository';
import { Form } from './entities/form.schema';
import { Types } from 'mongoose';
import { CollaboratorsRepository } from 'src/projects/collaborators.repository';

@Injectable()
export class FormsService {
  constructor(
    private readonly formRepository: FormsRepository,
    private readonly collaboratorsRepository: CollaboratorsRepository,
  ) {}

  async createForm(formDto: CreateFormDTO, userId: any): Promise<FormDTO> {
    // check if user is authorized to create form
    // ie. user is a owner or manager of the project

    const form = new Form({
      _id: new Types.ObjectId(),
      name: formDto.name,
      description: formDto.description,
      projectId: new Types.ObjectId(formDto.projectId),
      isPrivate: true,
      isPublished: false,
      multipleResponses: true,
    });

    const createdForm = await this.formRepository.create(form);

    return {
      ...createdForm,
      id: createdForm._id.toString(),
      projectId: createdForm.projectId.toString(),
    };
  }

  async getForms(projectId: string, userId: string): Promise<FormDTO[]> {
    const forms = await this.formRepository.find({
      projectId: new Types.ObjectId(projectId),
    });

    return forms.map((form) => ({
      ...form,
      id: form._id.toString(),
      projectId: form.projectId.toString(),
    }));
  }

  async getForm(formId: string): Promise<FormDTO> {
    const form = await this.formRepository.findById(formId);

    return {
      ...form,
      id: form._id.toString(),
      projectId: form.projectId.toString(),
    };
  }

  async updateForm(formId: string, formDto: FormDTO): Promise<FormDTO> {
    // remove prop projectId from formDto
    let { projectId, ...form } = formDto;

    let update : Partial<Form> = {
      ...form,
    };

    // if published form, update draft by first getting the form 
    // and then updating the draft
    if (form.isPublished) {
      let existingForm = await this.formRepository.findById(formId);
      if (!existingForm) {
        throw new NotFoundException('Form not found');
      }
      const changes = this.publishChanges(existingForm);
      update = {
        ...update,
        ...changes
      };
    }

    const updatedForm = await this.formRepository.update(formId, update);
    return {
      ...updatedForm,
      id: updatedForm._id.toString(),
      projectId: updatedForm.projectId.toString(),
    };
  }

  async publishForm(formId: string) {
    // existing schema
    const form = await this.formRepository.findById(formId);

    if (!form.draft || form.draft.length === 0) {
      throw new ConflictException('Form draft is empty');
    }

    return this.formRepository.update(formId, this.publishChanges(form));
  }

  private publishChanges(form: Form) {
    return {
      isPublished: true,
      hasChanges: false,
      schema: form.draft,
    };
  }

  async deleteForm(formId: string) {
    return this.formRepository.delete(formId);
  }

  async saveFormSchema(formId: string, schema: any) {
    return this.formRepository.update(formId, {
      draft: schema,
      hasChanges: true,
    });
  }
  async fetchParticipants(projectId: string, formId: string): Promise<ParticipantsDTO[]> {
    const form = await this.formRepository.findById(formId);
    if (!form) {
      throw new Error('Form not found');
    }
    return form.participants;
  }

  async addParticipants(projectId: string, formId: string, emails: string[], userId: string): Promise<any> {
    const form = await this.formRepository.findById(formId);
    if (!form) {
      throw new Error('Form not found');
    }

    // Check if the user is a project owner  
    const owner = await this.collaboratorsRepository.findOwnerByProjectIdAndUserId(projectId, userId);
    if (!owner) {
      throw new Error('Unauthorized access');
    }

    const newParticipants = emails.map(email => ({
      email,
      id: new Types.ObjectId().toString(),
    }));

    form.participants.push(...newParticipants);
    await this.formRepository.update(formId, form);

    return { message: 'Participants added successfully', success: true };
  }


  async removeParticipant(projectId: string, formId: string, participantId: string): Promise<void> {
    const form = await this.formRepository.findById(formId);
    if (!form) {
      throw new Error('Form not found');
    }
    form.participants = form.participants.filter(p => p.id !== participantId);
    await this.formRepository.update(formId, form);
  }
}
