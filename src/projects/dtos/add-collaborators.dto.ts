import { ProjectRoleEnum } from '../entities/project-role.enum';

export class AddCollaboratorsDto {
  userIds: string[];
  roles: ProjectRoleEnum[];
  projectId: string;
}