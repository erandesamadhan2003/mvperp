import { AppSidebarLayout } from "@/shared/components/layouts/Sidebar";
import { RoleId } from "@/core/utils/constant";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <AppSidebarLayout requiredRole={RoleId.Admin}>
            {children}
        </AppSidebarLayout>
    );
}
