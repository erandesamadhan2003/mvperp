import { RoleId } from "@/core/utils/constant";
import { AppSidebarLayout } from "@/shared/components/layouts/Sidebar";
import type { ReactNode } from "react";

export default function StudentLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <AppSidebarLayout requiredRole={RoleId.Student}>
            <div className="min-w-0 overflow-x-hidden">{children}</div>
        </AppSidebarLayout>
    );
}
