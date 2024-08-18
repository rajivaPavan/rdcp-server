import { RoleEnum } from "./user.schema";

export interface AddUserDTO {
    name: string;
    email: string;
    role: RoleEnum;
} 

export interface ResetPasswordDto{
    email: string;
    otp: string;
    password: string;
}
