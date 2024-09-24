import { SetMetadata } from '@nestjs/common';
import { FormAction } from 'src/authorization/forms.authorization';

export const FormActionMeta = (action: FormAction) => SetMetadata('form-action', action);
