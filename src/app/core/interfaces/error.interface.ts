export interface IApiError {
    message: string;
    status?: number;
    error?: string;
    details?: string[];
}

export interface IValidationError {
    field: string;
    message: string;
}
