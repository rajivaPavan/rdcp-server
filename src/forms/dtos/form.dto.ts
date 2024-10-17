import { ArrayNotEmpty, IsArray, IsEmail } from "class-validator";
import { Form } from "../entities/form.schema";

export class FormDTO {
  projectId: string;
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  isPublished: boolean;
  multipleResponses: boolean;

  static fromEntity(form: Form): FormDTO {
    return {
      ...form,
      projectId: form.projectId.toString(),
      id: form._id.toString(),
    }
  }
}

export interface CreateFormDTO {
  projectId: string;
  name: string;
  description: string;
}

export interface UpdateFormDTO {
  projectId?: string;
  name?: string;
  description?: string;
  isPrivate?: boolean;
  isPublished?: boolean;
  multipleResponses?: boolean;
}

export interface ParticipantsDTO {
  email?: string;
  id: string;
}

export class AddParticipantsDTO {
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  emails: string[];
}