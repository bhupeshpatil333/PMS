import { UserRoleEnum } from '../enums/user.enum';

export interface UserFormValues {
    id?: number;
    fullName: string;
    email: string;
    password?: string;
    role: UserRoleEnum;
    isActive?: boolean;
}

export interface CreateUserDto {
    fullName: string;
    email: string;
    password: string;
    role: UserRoleEnum;
}

export interface UpdateUserDto {
    fullName: string;
    email: string;
    password?: string;
    role: UserRoleEnum;
    isActive: boolean;
}
