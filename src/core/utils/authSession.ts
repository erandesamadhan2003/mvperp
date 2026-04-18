import { api } from "../api/client";
import { AuthSession, LoginResponse } from "../types/auth.types";

const AUTH_SESSION_KEY = "auth-session";
const TOKEN_KEY = "token";
const USER_KEY = "user";
const ONE_SECOND_IN_MS = 1000;

export const createSession = (response: LoginResponse, academicYear?: string): AuthSession => {
    const issuedAt = Date.now();
    const expiresInMs = Math.max(response.ResponseData.ExpiresIn, 0) * ONE_SECOND_IN_MS;

    return {
        token: response.ResponseData.IdToken,
        user: response.ResponseData.UserData,
        issuedAt,
        expiresAt: issuedAt + expiresInMs,
        academicYear,
    };
};

export const persistSession = (session: AuthSession): void => {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    api.defaults.headers.common.Authorization = `Bearer ${session.token}`;
};

export const clearSessionStorage = (): void => {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common.Authorization;
};

export const isValidSession = (session: AuthSession | null): session is AuthSession => {
    if (!session) {
        return false;
    }

    return Boolean(session.token) && session.expiresAt > Date.now();
};

export const readStoredSession = (): AuthSession | null => {
    if (typeof window === "undefined") {
        return null;
    }

    const storedSession = localStorage.getItem(AUTH_SESSION_KEY);
    if (!storedSession) {
        return null;
    }

    try {
        const parsed = JSON.parse(storedSession) as AuthSession;
        if (!isValidSession(parsed)) {
            clearSessionStorage();
            return null;
        }

        api.defaults.headers.common.Authorization = `Bearer ${parsed.token}`;
        return parsed;
    } catch {
        clearSessionStorage();
        return null;
    }
};
