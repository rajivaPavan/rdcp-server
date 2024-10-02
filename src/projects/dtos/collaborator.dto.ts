import { ProjectRoleEnum } from '../entities/project-role.enum';

export class CollaboratorDto {
  userId: string;
  email?: string;
  roles: ProjectRoleEnum[];
}