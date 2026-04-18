import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const attachAuthHeader = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

const handleResponseError = async (error: unknown): Promise<never> => {
    if (
        typeof window !== "undefined" &&
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { status?: number } }).response?.status === "number" &&
        (error as { response?: { status?: number } }).response?.status === 401
    ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("auth-session");
        window.location.href = "/login";
    }

    return Promise.reject(error);
};

export const setupInterceptors = (api: AxiosInstance): void => {
    api.interceptors.request.use(attachAuthHeader);
    api.interceptors.response.use((response) => response, handleResponseError);
};