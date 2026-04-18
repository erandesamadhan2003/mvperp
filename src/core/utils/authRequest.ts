import { AuthErrorDetails, LoginRequest } from "../types/auth.types";
import { AuthServiceError } from "../services/auth.service";
import { getIPAddress } from "@/core/utils/network";

const DEFAULT_LOGIN_ERROR_MESSAGE = "Unable to sign in right now. Please try again.";

const getAceYear = (): string => {
    return new Date().toISOString();
};

export const buildLoginPayload = async (payload: LoginRequest): Promise<LoginRequest> => {
    const userAccessAddress = payload.UserAccessAddress || (await getIPAddress());

    return {
        UserName: payload.UserName.trim(),
        Password: payload.Password,
        AceYear: payload.AceYear || getAceYear(),
        UserAccessAddress: userAccessAddress,
    };
};

export const normalizeAuthError = (error: unknown): AuthErrorDetails => {
    if (error instanceof AuthServiceError) {
        return {
            message: error.message,
            responseCode: error.responseCode,
            statusCode: error.statusCode,
        };
    }

    if (error instanceof Error) {
        return { message: error.message || DEFAULT_LOGIN_ERROR_MESSAGE };
    }

    return { message: DEFAULT_LOGIN_ERROR_MESSAGE };
};
