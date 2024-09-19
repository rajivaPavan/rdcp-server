import { ProjectRoleEnum } from '../entities/project-role.enum';

export class AddCollaboratorsDto {
  userIds: string[];
  emails: string[];
  roles: ProjectRoleEnum[];
  projectId: string;
}
