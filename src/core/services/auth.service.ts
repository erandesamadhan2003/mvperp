import { api } from "../api/client";
import { LoginRequest, LoginResponse } from "../types/auth.types";
import { AUTH_URL } from "../utils/constant"

export const authService = async (payload: LoginRequest): Promise<LoginResponse> => {
    try {
        const response = await api.post(AUTH_URL.LOGIN, payload);
        return response.data;
    } catch (error: any) {
        console.error("Login failed:", error);
        throw error;
    }
}