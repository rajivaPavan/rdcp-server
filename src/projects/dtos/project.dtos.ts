import { FormDTO } from '../../forms/dtos/form.dto';
import { ProjectRoleEnum } from '../entities/project-role.enum';

export class ProjectDTO {
  id: string;
  name: string;
  description: string;
  roles: ProjectRoleEnum[];
  forms?: FormDTO[];
  createdAt: Date;
  updatedAt?: Date;
}
