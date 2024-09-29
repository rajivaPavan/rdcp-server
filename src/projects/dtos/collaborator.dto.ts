import { ProjectRoleEnum } from '../entities/project-role.enum';

export class CollaboratorDto {
  userId: string;
  roles: ProjectRoleEnum[];
}

export interface CollaboratorDocument {
  id: string;
  email: string;
  roles: ProjectRoleEnum[];
}