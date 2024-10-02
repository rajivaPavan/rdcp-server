import { ProjectRoleEnum } from '../entities/project-role.enum';

export class AddCollaboratorsDto {
  roles: ProjectRoleEnum[];
  userIds: string[];
}
