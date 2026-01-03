export const APP_CONSTANTS = {
  API: {
    BASE_URL: 'http://localhost:5103/api',
    TIMEOUT: 30000, // 30 seconds
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  },
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 6,
    EMAIL_PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
  MESSAGES: {
    SUCCESS: {
      USER_CREATED: 'User created successfully',
      USER_UPDATED: 'User updated successfully',
      USER_DELETED: 'User deactivated successfully',
    },
    ERROR: {
      GENERIC: 'An error occurred. Please try again.',
      NETWORK: 'Network error occurred. Please check your connection.',
    },
  },
} as const;

export type ApiEndpoint = keyof typeof APP_CONSTANTS.API;
export type PaginationSize = typeof APP_CONSTANTS.PAGINATION.PAGE_SIZE_OPTIONS[number];