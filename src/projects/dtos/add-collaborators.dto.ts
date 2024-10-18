import { ProjectRoleEnum } from '../entities/project-role.enum';
import { IsArray, IsEmail, IsEnum, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AddCollaboratorsDto {
  @IsArray()
  @IsEnum(ProjectRoleEnum, { each: true })
  roles: ProjectRoleEnum[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserDto)
  users: UserDto[];
}

class UserDto {
  @IsString()
  id: string;

  @IsEmail()
  email: string;
}
