// Utility types
export type PartialPick<T, K extends keyof T> = {
  [P in K]?: T[P];
};

export type RequiredPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Common types
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export type FilterOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
};

// Status types
export type Status = 'idle' | 'loading' | 'success' | 'error';