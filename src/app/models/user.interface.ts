export interface User {
    id: number;
    fullName: string;
    email: string;
    role: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}
