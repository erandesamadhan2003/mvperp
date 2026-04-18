import axios from "axios";
import { api } from "../api/client";
import { LoginRequest, LoginResponse } from "../types/auth.types";
import { AUTH_URL } from "../utils/APIURL";

const SUCCESS_RESPONSE_CODES = new Set([1, 200]);

interface AuthServiceErrorMetadata {
    responseCode?: number;
    statusCode?: number;
}

export class AuthServiceError extends Error {
    responseCode?: number;
    statusCode?: number;

    constructor(message: string, metadata: AuthServiceErrorMetadata = {}) {
        super(message);
        this.name = "AuthServiceError";
        this.responseCode = metadata.responseCode;
        this.statusCode = metadata.statusCode;
    }
}

const isObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null;
};

const isLoginResponse = (value: unknown): value is LoginResponse => {
    if (!isObject(value)) {
        return false;
    }

    if (typeof value.ResponseCode !== "number") {
        return false;
    }

    if (!(typeof value.Message === "string" || value.Message === null)) {
        return false;
    }

    if (!isObject(value.ResponseData)) {
        return false;
    }

    return (
        typeof value.ResponseData.IdToken === "string" &&
        typeof value.ResponseData.ExpiresIn === "number" &&
        isObject(value.ResponseData.UserData)
    );
};

const getResponseCodeFromError = (data: unknown): number | undefined => {
    if (!isObject(data) || typeof data.ResponseCode !== "number") {
        return undefined;
    }

    return data.ResponseCode;
};

export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
    try {
        const response = await api.post<LoginResponse>(AUTH_URL.LOGIN, payload);

        if (!isLoginResponse(response.data)) {
            throw new AuthServiceError("Received an unexpected response from the login API.");
        }

        if (!SUCCESS_RESPONSE_CODES.has(response.data.ResponseCode)) {
            throw new AuthServiceError(
                response.data.Message ?? "Login failed. Please verify your username and password.",
                { responseCode: response.data.ResponseCode }
            );
        }

        return response.data;
    } catch (error: unknown) {
        if (error instanceof AuthServiceError) {
            throw error;
        }

        if (axios.isAxiosError(error)) {
            const responseCode = getResponseCodeFromError(error.response?.data);
            const fallbackMessage = "Unable to sign in right now. Please try again.";
            const apiMessage =
                isObject(error.response?.data) && typeof error.response?.data?.Message === "string"
                    ? error.response.data.Message
                    : undefined;

            throw new AuthServiceError(apiMessage ?? error.message ?? fallbackMessage, {
                responseCode,
                statusCode: error.response?.status,
            });
        }

        throw new AuthServiceError("Unexpected error occurred during login.");
    }
};