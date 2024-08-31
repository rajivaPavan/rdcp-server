import { ProjectRoleEnum } from '../entities/project-role.enum';

export class CollaboratorDto {
  userId: string;
  roles: ProjectRoleEnum[];
}