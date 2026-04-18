"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import {
    ArrowRight,
    Home,
    KeyRound,
    Loader2,
    LockKeyhole,
    Mail,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import { useAuth } from "@/core/hooks/useAuth";
import { getIPAddress } from "@/core/utils/network";
import { RoleId } from "@/core/utils/constant";
import type { LoginRequest, UserData } from "@/core/types/auth.types";

type LoginFormState = {
    UserName: string;
    Password: string;
};

const initialState: LoginFormState = {
    UserName: "",
    Password: "",
};

const resolveDashboardPath = (user: UserData): string => {
    if (user.RoleId === RoleId.Admin) {
        return "/admin";
    }

    if (user.RoleId === RoleId.Faculty) {
        return "/faculty";
    }

    return "/student";
};

export default function LoginPage() {
    const router = useRouter();
    const { loginUser, isLoading, error } = useAuth();
    const [form, setForm] = useState<LoginFormState>(initialState);
    const [touched, setTouched] = useState(false);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setTouched(true);

        const userName = form.UserName.trim();
        const password = form.Password.trim();

        if (!userName || !password) {
            return;
        }

        try {
            const userAccessAddress = await getIPAddress();
            const payload: LoginRequest = {
                UserName: userName,
                Password: password,
                AceYear: new Date().toISOString(),
                UserAccessAddress: userAccessAddress,
            };

            const response = await loginUser(payload);
            router.replace(resolveDashboardPath(response.ResponseData.UserData));
        } catch {

        }
    };

    const isSubmitDisabled = isLoading || !form.UserName.trim() || !form.Password.trim();
    const showUserNameError = touched && !form.UserName.trim();
    const showPasswordError = touched && !form.Password.trim();

    return (
        <main className="erp-page-shell relative min-h-screen overflow-hidden px-4 py-6 text-(--erp-text) sm:px-6 lg:px-8">
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(140deg,rgba(255,255,255,0.82),rgba(237,242,247,0.35))]" />

            <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-384 items-center justify-center">
                <section className="erp-surface grid w-full overflow-hidden rounded-[30px] lg:grid-cols-[0.96fr_1.54fr]">
                    <div className="flex flex-col justify-between bg-(--erp-surface) px-6 py-8 sm:px-10 sm:py-10 lg:px-12">
                        <div>
                            <div className="mb-8 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-(--erp-accent)">
                                <Sparkles className="h-4 w-4" />
                                Secure access
                            </div>

                            <div className="mb-8 text-center">
                                <h1 className="text-3xl font-semibold tracking-tight text-(--erp-primary-900) sm:text-4xl">
                                    Login Now !!
                                </h1>
                                <div className="mx-auto mt-4 h-1.5 w-24 rounded-full bg-linear-to-r from-(--erp-accent) via-(--erp-primary-800) to-(--erp-warm)" />
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label htmlFor="username" className="block text-sm font-semibold text-(--erp-text)">
                                        Email as User Name
                                    </label>
                                    <div className="flex overflow-hidden rounded-xl border border-(--erp-border) bg-white shadow-sm transition focus-within:border-(--erp-accent) focus-within:ring-2 focus-within:ring-cyan-100">
                                        <div className="flex w-12 items-center justify-center border-r border-(--erp-border) bg-(--erp-surface-muted) text-(--erp-text-muted)">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <input
                                            id="username"
                                            name="UserName"
                                            type="email"
                                            autoComplete="username"
                                            inputMode="email"
                                            placeholder="UserName As Email"
                                            value={form.UserName}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                            aria-invalid={showUserNameError}
                                            className="h-11 w-full px-4 text-sm outline-none placeholder:text-slate-400 disabled:bg-slate-50"
                                        />
                                    </div>
                                    {showUserNameError ? (
                                        <p className="text-xs text-amber-700">User name is required.</p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="password" className="block text-sm font-semibold text-(--erp-text)">
                                        Password
                                    </label>
                                    <div className="flex overflow-hidden rounded-xl border border-(--erp-border) bg-white shadow-sm transition focus-within:border-(--erp-accent) focus-within:ring-2 focus-within:ring-cyan-100">
                                        <div className="flex w-12 items-center justify-center border-r border-(--erp-border) bg-(--erp-surface-muted) text-(--erp-text-muted)">
                                            <LockKeyhole className="h-4 w-4" />
                                        </div>
                                        <input
                                            id="password"
                                            name="Password"
                                            type="password"
                                            autoComplete="current-password"
                                            placeholder="eCampus Password"
                                            value={form.Password}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                            aria-invalid={showPasswordError}
                                            className="h-11 w-full px-4 text-sm outline-none placeholder:text-slate-400 disabled:bg-slate-50"
                                        />
                                    </div>
                                    {showPasswordError ? <p className="text-xs text-amber-700">Password is required.</p> : null}
                                </div>

                                {error ? (
                                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                        {error.message}
                                    </div>
                                ) : null}

                                <button
                                    type="submit"
                                    disabled={isSubmitDisabled}
                                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-(--erp-primary-900) px-4 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_12px_24px_rgba(18,41,74,0.35)] transition hover:bg-(--erp-primary-800) disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    {isLoading ? "Signing In" : "Login"}
                                </button>

                                <p className="text-center text-sm text-(--erp-text-muted)">
                                    Don&apos;t have an account?{" "}
                                    <Link href="/register" className="font-semibold text-(--erp-accent) transition hover:text-(--erp-accent-strong)">
                                        Register
                                    </Link>
                                </p>
                            </form>
                        </div>

                        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
                            <Link
                                href="/"
                                className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-(--erp-accent) text-white shadow-[0_10px_20px_rgba(14,116,144,0.32)] transition hover:bg-(--erp-accent-strong)"
                                aria-label="Go to home"
                            >
                                <Home className="h-5 w-5" />
                            </Link>

                            <button
                                type="button"
                                className="inline-flex h-11 items-center gap-2 rounded-xl bg-(--erp-warm) px-4 text-sm font-medium text-white shadow-[0_10px_20px_rgba(180,83,9,0.35)] transition hover:bg-amber-700"
                                title="Password recovery is handled by your campus administrator"
                            >
                                <KeyRound className="h-4 w-4" />
                                Forgot Password?
                            </button>
                        </div>
                    </div>

                    <div className="relative min-h-90 overflow-hidden bg-linear-to-br from-(--erp-primary-900) via-(--erp-primary-800) to-(--erp-accent) lg:min-h-173">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_22%,rgba(255,255,255,0.16),transparent_32%),radial-gradient(circle_at_78%_80%,rgba(255,255,255,0.2),transparent_30%)]" />
                        <div className="absolute inset-0 opacity-85">
                            <Image
                                src="/eCampus.png"
                                alt="eCampus platform illustration"
                                fill
                                priority
                                sizes="(max-width: 1024px) 100vw, 58vw"
                                className="object-contain object-center"
                            />
                        </div>

                        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/5 via-transparent to-transparent" />
                    </div>
                </section>
            </div>
        </main>
    );
}
