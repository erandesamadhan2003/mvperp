import { RoleId } from "@/core/utils/constant";
import { AppSidebarLayout } from "@/shared/components/layouts/Sidebar";
import type { ReactNode } from "react";

export default function FacultyLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <AppSidebarLayout requiredRole={RoleId.Faculty}>
            {children}
        </AppSidebarLayout>
    );
}
