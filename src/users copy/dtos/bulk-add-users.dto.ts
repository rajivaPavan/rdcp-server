// src/users/dtos/bulk-add-users.dto.ts
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { UserRoleEnum } from '../entities/user-role.enum';

export class BulkAddUsersDTO {
  @IsEmail()
  email: string;

  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;
}
