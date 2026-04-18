"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { LogOut, Menu, Minus, Plus, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAuth } from "@/core/hooks/useAuth";
import type { MenuItem, UserData } from "@/core/types/auth.types";
import {
    buildHierarchicalMenu,
    getRoleRoute,
    mapMenuHrefByRole,
    renderMenuIcon,
} from "@/shared/utils";

type AppSidebarLayoutProps = {
    children: ReactNode;
    requiredRole: number;
};

type MenuNodeProps = {
    item: MenuItem;
    depth: number;
    roleId: number;
    pathname: string;
    expandedIds: Record<number, boolean>;
    onToggle: (menuId: number) => void;
    onNavigate: () => void;
};

const FALLBACK_AVATAR = "/mvplogo.png";

const normalizeProfileImage = (value: string | null | undefined): string => {
    if (!value) {
        return FALLBACK_AVATAR;
    }

    const normalized = value.trim().replace(/\s+/g, "");
    if (!normalized) {
        return FALLBACK_AVATAR;
    }

    if (normalized.startsWith("data:image")) {
        return normalized;
    }

    if (normalized.startsWith("/9j/") || /^[A-Za-z0-9+/=]+$/.test(normalized)) {
        return `data:image/jpeg;base64,${normalized}`;
    }

    return normalized;
};

const isHrefExactActive = (href: string | null, pathname: string): boolean => {
    if (!href || /^https?:\/\//i.test(href)) {
        return false;
    }

    return pathname === href;
};

const isMenuBranchActive = (item: MenuItem, pathname: string, roleId: number): boolean => {
    const href = mapMenuHrefByRole(item.FormLink, roleId);
    if (isHrefExactActive(href, pathname)) {
        return true;
    }

    return (item.Childrens ?? []).some((child) => isMenuBranchActive(child, pathname, roleId));
};

const isMenuItemActive = (item: MenuItem, pathname: string, roleId: number): boolean => {
    const href = mapMenuHrefByRole(item.FormLink, roleId);
    return isHrefExactActive(href, pathname);
};

const collectActiveParentIds = (items: MenuItem[], pathname: string, roleId: number): number[] => {
    const activeParentIds = new Set<number>();

    const walk = (node: MenuItem, parentIds: number[]) => {
        if (isMenuBranchActive(node, pathname, roleId)) {
            parentIds.forEach((parentId) => activeParentIds.add(parentId));
        }

        const nextParents = [...parentIds, node.MenuIdentity];
        (node.Childrens ?? []).forEach((child) => walk(child, nextParents));
    };

    items.forEach((item) => walk(item, []));
    return [...activeParentIds];
};

function MenuNode({ item, depth, roleId, pathname, expandedIds, onToggle, onNavigate }: MenuNodeProps) {
    const href = mapMenuHrefByRole(item.FormLink, roleId);
    const hasChildren = Boolean(item.Childrens && item.Childrens.length > 0);
    const isActive = isMenuItemActive(item, pathname, roleId);
    const isExpanded = expandedIds[item.MenuIdentity] ?? false;

    const baseClasses = `group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${isActive
        ? "bg-[var(--erp-accent)] text-white shadow-[0_8px_22px_rgba(14,116,144,0.35)]"
        : "text-slate-100 hover:bg-white/12 hover:text-white"
        }`;

    const containerStyle = {
        paddingLeft: `${0.75 + depth * 0.65}rem`,
    };

    const label = (
        <>
            {renderMenuIcon(item)}
            <span className="truncate">{item.MenuName}</span>
        </>
    );

    return (
        <li>
            <div className="flex items-center gap-1" style={containerStyle}>
                {href ? (
                    /^https?:\/\//i.test(href) ? (
                        <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className={baseClasses}
                            onClick={onNavigate}
                        >
                            {label}
                        </a>
                    ) : (
                        <Link href={href} className={baseClasses} onClick={onNavigate}>
                            {label}
                        </Link>
                    )
                ) : (
                    <button type="button" className={baseClasses} onClick={() => hasChildren && onToggle(item.MenuIdentity)}>
                        {label}
                    </button>
                )}

                {hasChildren ? (
                    <button
                        type="button"
                        onClick={() => onToggle(item.MenuIdentity)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-white/12 hover:text-white"
                        aria-label={isExpanded ? `Collapse ${item.MenuName}` : `Expand ${item.MenuName}`}
                        aria-expanded={isExpanded}
                    >
                        {isExpanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </button>
                ) : null}
            </div>

            {hasChildren && isExpanded ? (
                <ul className="mt-1 space-y-1">
                    {(item.Childrens ?? []).map((child) => (
                        <MenuNode
                            key={child.MenuIdentity}
                            item={child}
                            depth={depth + 1}
                            roleId={roleId}
                            pathname={pathname}
                            expandedIds={expandedIds}
                            onToggle={onToggle}
                            onNavigate={onNavigate}
                        />
                    ))}
                </ul>
            ) : null}
        </li>
    );
}

export function AppSidebarLayout({ children, requiredRole }: AppSidebarLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { session, isAuthenticated, logoutUser } = useAuth();

    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [manualExpandedIds, setManualExpandedIds] = useState<Record<number, boolean>>({});

    const user: UserData | null = session?.user ?? null;
    const menuItems = useMemo(() => {
        if (!user?.Menu) return [];
        const dashboardMenu: MenuItem = {
            MenuIdentity: -requiredRole,
            MenuId: -requiredRole,
            ParentMenuId: null,
            HasChildren: false,
            ModuleId: 0,
            MenuNumber: 0,
            MenuName: "Dashboard",
            CSSClass: "",
            NgClass: "",
            FormLink: getRoleRoute(requiredRole),
            IsActive: true,
            Childrens: [],
        };

        return [dashboardMenu, ...buildHierarchicalMenu(user.Menu)];
    }, [requiredRole, user]);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            router.replace("/login");
            return;
        }

        if (user.RoleId !== requiredRole) {
            router.replace(getRoleRoute(user.RoleId));
        }
    }, [isAuthenticated, requiredRole, router, user]);

    const expandedIds = useMemo(() => {
        const activeParents = collectActiveParentIds(menuItems, pathname, requiredRole);
        const next = { ...manualExpandedIds };
        activeParents.forEach((parentId) => {
            next[parentId] = true;
        });
        return next;
    }, [manualExpandedIds, menuItems, pathname, requiredRole]);

    const toggleExpanded = useCallback((menuId: number) => {
        setManualExpandedIds((current) => ({
            ...current,
            [menuId]: !current[menuId],
        }));
    }, []);

    const closeMobileSidebar = useCallback(() => {
        setIsMobileSidebarOpen(false);
    }, []);

    const handleLogout = () => {
        logoutUser();
        router.replace("/login");
    };


    if (!isAuthenticated || !user) {
        return (
            <div className="erp-page-shell min-h-screen text-(--erp-text)" suppressHydrationWarning>
                <header className="erp-topbar sticky top-0 z-30 border-b border-white/15 shadow-[0_12px_35px_rgba(11,29,56,0.35)]">
                    <div className="flex h-16 items-center justify-between px-3 md:px-6">
                        <div />
                        <h1 className="text-base font-semibold tracking-wide text-white md:text-lg" suppressHydrationWarning>
                            Authenticating...
                        </h1>
                    </div>
                </header>
                <div className="flex">
                    <aside className="hidden w-80 flex-col border-r border-white/10 bg-(--erp-primary-900) md:flex" />
                    <main className="w-full flex-1 p-4 md:p-6">
                        <div className="erp-surface min-h-[calc(100vh-7.5rem)] rounded-2xl p-4 md:p-6" />
                    </main>
                </div>
            </div>
        );
    }

    const profileImage = normalizeProfileImage(user.ProfilePhoto || user.EmpPhoto);

    const sidebarContent = (
        <>
            <div className="border-b border-white/10 bg-linear-to-r from-(--erp-primary-800) to-(--erp-primary-900) px-5 py-5">
                <div className="flex items-center gap-3">
                    <img
                        src={profileImage}
                        alt={user.FullName || user.StudentName || "Profile"}
                        className="h-14 w-14 rounded-full border border-slate-200/50 bg-white object-cover"
                    />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                            {user.StudentName || user.FullName || user.UserName}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-cyan-300">
                            {user.InstituteName || user.OrganizationName}
                        </p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto bg-(--erp-primary-900)/98 px-3 py-4" aria-label="Role menu">
                <ul className="space-y-1.5">
                    {menuItems.map((menu) => (
                        <MenuNode
                            key={menu.MenuIdentity}
                            item={menu}
                            depth={0}
                            roleId={requiredRole}
                            pathname={pathname}
                            expandedIds={expandedIds}
                            onToggle={toggleExpanded}
                            onNavigate={closeMobileSidebar}
                        />
                    ))}
                </ul>
            </nav>

            <div className="border-t border-white/10 bg-(--erp-primary-900) p-3">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--erp-warm) px-3 py-2.5 text-sm font-medium text-white shadow-[0_10px_20px_rgba(180,83,9,0.35)] transition hover:bg-amber-700"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </>
    );

    return (
        <div className="erp-page-shell min-h-screen text-(--erp-text)" suppressHydrationWarning>
            <header className="erp-topbar sticky top-0 z-30 border-b border-white/15 shadow-[0_12px_35px_rgba(11,29,56,0.35)]" suppressHydrationWarning>
                <div className="flex h-16 items-center justify-between px-3 md:px-6">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsMobileSidebarOpen((current) => !current)}
                            className="grid h-10 w-10 place-items-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20 md:hidden"
                            aria-label="Toggle sidebar"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsDesktopSidebarOpen((current) => !current)}
                            className="hidden h-10 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-medium text-white transition hover:bg-white/20 md:inline-flex"
                            aria-label="Toggle sidebar"
                        >
                            {isDesktopSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
                        </button>
                    </div>

                    <h1 className="text-base font-semibold tracking-wide text-white md:text-lg" suppressHydrationWarning>
                        Welcome, {user?.StudentName || user?.FullName || "User"}
                    </h1>
                </div>
            </header>

            <div className="flex">
                <aside
                    className={`fixed inset-y-0 left-0 z-40 mt-16 flex w-80 -translate-x-full flex-col border-r border-white/10 bg-(--erp-primary-900) shadow-2xl transition-transform duration-300 md:hidden ${isMobileSidebarOpen ? "translate-x-0" : ""
                        }`}
                >
                    {sidebarContent}
                </aside>

                {isMobileSidebarOpen ? (
                    <button
                        type="button"
                        onClick={closeMobileSidebar}
                        className="fixed inset-0 z-30 mt-16 bg-black/50 md:hidden"
                        aria-label="Close sidebar"
                    />
                ) : null}

                <aside
                    className={`hidden flex-col border-r border-white/10 bg-(--erp-primary-900) md:flex md:transition-all md:duration-300 ${isDesktopSidebarOpen ? "md:w-80" : "md:w-0 md:overflow-hidden md:border-r-0"
                        }`}
                >
                    {sidebarContent}
                </aside>

                <main className="w-full flex-1 p-4 md:p-6">
                    <div className="erp-surface min-h-[calc(100vh-7.5rem)] rounded-2xl p-4 md:p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
