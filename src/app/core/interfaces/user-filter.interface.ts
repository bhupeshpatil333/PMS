import { UserStatusEnum } from '../enums/user.enum';

export interface UserFilter {
    status?: UserStatusEnum | 'All';
    role?: string;
    search?: string;
}
