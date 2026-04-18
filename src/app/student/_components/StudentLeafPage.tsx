import type { ReactNode } from "react";

type StudentLeafPageProps = {
    title: string;
    modulePath: string;
    children?: ReactNode;
};

export function StudentLeafPage({ title, modulePath, children }: StudentLeafPageProps) {
    return (
        <section className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                <p className="mt-2 text-sm text-slate-600">Module: {modulePath}</p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                <p className="text-slate-600">
                    Content for <span className="font-semibold text-slate-900">{title}</span> will be displayed here.
                </p>
                <p className="mt-2 text-sm text-slate-500">Full path: /{modulePath}</p>
                {children ? <div className="mt-6">{children}</div> : null}
            </div>
        </section>
    );
}