// src/admin/dtos/add-user.dto.ts
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export class AddUserDTO {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(['user', 'admin'])
  role: 'user' | 'admin';
}
