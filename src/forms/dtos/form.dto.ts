import { ArrayNotEmpty, IsArray, IsEmail } from "class-validator";

export interface FormDTO {
  projectId: string;
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  isPublished: boolean;
  multipleResponses: boolean;
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