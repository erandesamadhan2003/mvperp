import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
    CalendarDays,
    CircleHelp,
    ClipboardList,
    Contact,
    GraduationCap,
    Home,
    ListChecks,
    LogIn,
    Trophy,
} from "lucide-react";

const navItems = [
    { label: "Home", href: "/", className: "text-slate-800", icon: Home },
    { label: "Counselling List", href: "/", className: "text-red-500", icon: ListChecks },
    { label: "Merit List", href: "/", className: "text-slate-800", icon: Trophy },
    { label: "Time Table", href: "/", className: "timetable-blink", icon: CalendarDays },
    { label: "Result", href: "/", className: "text-slate-800", icon: ClipboardList },
    { label: "Help Desk", href: "/", className: "text-slate-800", icon: CircleHelp },
    { label: "Contact", href: "/", className: "text-slate-800", icon: Contact },
    { label: "Branch Info", href: "/", className: "text-slate-800", icon: GraduationCap },
    { label: "Login Now", href: "/login", className: "text-red-500", icon: LogIn },
] as const satisfies ReadonlyArray<{
    label: string;
    href: string;
    className: string;
    icon: LucideIcon;
}>;

export function Navbar() {

    return (
        <header>
            <div className="erp-topbar border-b border-white/15 px-4 py-3 text-center shadow-[0_10px_32px_rgba(11,29,56,0.35)]">
                <h1 className="text-balance text-xl font-semibold tracking-wide text-white md:text-4xl">
                    मराठा विद्या प्रसारक समाज, नाशिक
                </h1>
            </div>

            <div className="border-b border-(--erp-border) bg-(--erp-surface) px-2 md:px-4">
                <div className="mx-auto flex w-full max-w-384 flex-col items-center justify-between gap-3 py-3 md:flex-row md:gap-4">
                    <Link href="/" className="shrink-0" aria-label="MVP Home">
                        <Image
                            src="/mvplogo.png"
                            alt="MVP Nashik logo"
                            width={64}
                            height={64}
                            className="h-14 w-14 rounded-full border border-slate-200 bg-white p-1 object-contain shadow-sm"
                            priority
                        />
                    </Link>

                    <nav className="flex flex-1 flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm font-semibold md:justify-end">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`inline-flex items-center gap-1.5 rounded-full border border-transparent px-3 py-1.5 ${item.className} transition-all duration-200 hover:border-(--erp-border) hover:bg-(--erp-surface-muted) hover:text-(--erp-primary-900)`}
                            >
                                <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    )
}