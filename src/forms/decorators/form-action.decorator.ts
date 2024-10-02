import { SetMetadata } from '@nestjs/common';
import { ProjectAction } from 'src/authorization/projects.authorization';

export const FormActionMeta = (action: ProjectAction) => SetMetadata('form-action', action);
