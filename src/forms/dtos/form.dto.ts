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