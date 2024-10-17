import { ProjectRoleEnum } from '../entities/project-role.enum';

export class AddCollaboratorsDto {
  roles: ProjectRoleEnum[];
  users: {
    id: string;
    email: string;
  }[];
}
