import { UserRoleEnum } from '../entities/user-role.enum';

export class AddUserDTO {
  name: string;
  email: string;
  role: UserRoleEnum;
}
