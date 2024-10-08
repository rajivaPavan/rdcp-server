// src/admin/dtos/bulk-add-users.dto.ts
import { IsEmail, IsEnum } from 'class-validator';

export class BulkAddUsersDTO {
  @IsEmail()
  email: string;

  @IsEnum(['user', 'admin'])
  role: 'user' | 'admin';
}
