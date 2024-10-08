import { UserRoleEnum } from '../entities/user-role.enum';
import { User } from '../entities/user.schema';

export class AddUserDTO {
  name: string;
  email: string;
  role: UserRoleEnum;
}

export class UserDTO {
  id: string;
  name: string;
  email: string;
  role: UserRoleEnum;

  static fromUser(user: User): UserDTO {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
