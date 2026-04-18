"use client";

import { useCallback, useMemo, useState } from "react";
import { login } from "../services/auth.service";
import { LoginRequest } from "../types/auth.types";
import { AuthErrorDetails, AuthSession, LoginResponse } from "../types/auth.types";
import { buildLoginPayload, normalizeAuthError } from "../utils/authRequest";
import {
    clearSessionStorage,
    createSession,
    isValidSession,
    persistSession,
    readStoredSession,
} from "../utils/authSession";

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<AuthErrorDetails | null>(null);
    const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());

    const loginUser = useCallback(async (payload: LoginRequest): Promise<LoginResponse> => {
        setIsLoading(true);
        setError(null);

        try {
            const requestPayload = await buildLoginPayload(payload);
            const response = await login(requestPayload);
            const nextSession = createSession(response, requestPayload.AceYear);
            persistSession(nextSession);
            setSession(nextSession);
            return response;
        } catch (loginError: unknown) {
            const normalizedError = normalizeAuthError(loginError);
            setError(normalizedError);
            throw normalizedError;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logoutUser = useCallback(() => {
        clearSessionStorage();
        setSession(null);
        setError(null);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const isAuthenticated = useMemo(() => isValidSession(session), [session]);

    return {
        isLoading,
        error,
        session,
        isAuthenticated,
        loginUser,
        logoutUser,
        clearError,
        getStoredSession: readStoredSession,
    };
};