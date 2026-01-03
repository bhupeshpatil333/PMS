import { UserRoleEnum } from '../core/enums/user.enum';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRoleEnum;
  isActive?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
