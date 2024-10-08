// src/admin/dtos/create-whitelist.dto.ts
import { IsNotEmpty } from 'class-validator';

export class CreateWhitelistDto {
  @IsNotEmpty()
  domain: string;
}
