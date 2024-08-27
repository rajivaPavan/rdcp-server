import { ProjectRoleEnum } from "../projects/projects.schema";
import { Form } from "./form.schema";

export interface FormDTO{
    projectId: string;
    id: string;
    name: string;
    description: string;
    isPrivate: boolean;
    isPublished: boolean;
    multipleResponses: boolean;
}

export interface ProjectFormsResponseDTO {
    forms: FormDTO[];
}