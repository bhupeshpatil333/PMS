export const USER_ROLES = {
    ADMIN: 'Admin' as const,
    MANAGER: 'Manager' as const,
    EMPLOYEE: 'Employee' as const,
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const USER_STATUS = {
    ACTIVE: true,
    INACTIVE: false,
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];
