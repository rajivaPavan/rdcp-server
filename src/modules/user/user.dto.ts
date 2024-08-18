import { RoleEnum } from "./user.schema";

export interface AddUserDTO {
    name: string;
    email: string;
    role: RoleEnum;
} 



