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
    { label: "Login Now", href: "/", className: "text-red-500", icon: LogIn },
] as const satisfies ReadonlyArray<{
    label: string;
    href: string;
    className: string;
    icon: LucideIcon;
}>;

export function Navbar() {

    return (
        <header>
            <h1 className="bg-blue-900 px-4 py-3 text-center text-xl font-semibold text-white md:text-5xl">
                मराठा विद्या प्रसारक समाज, नाशिक
            </h1>

            <div className="border-b border-slate-200 bg-white px-1 md:px-2">
                <div className="flex w-full flex-col items-center justify-between gap-3 py-2 md:flex-row md:gap-4">
                    <Link href="/" className="shrink-0" aria-label="MVP Home">
                        <Image
                            src="/mvplogo.png"
                            alt="MVP Nashik logo"
                            width={64}
                            height={64}
                            className="h-14 w-14 object-contain"
                            priority
                        />
                    </Link>

                    <nav className="flex flex-1 flex-wrap items-center justify-center gap-x-10 gap-y-2 text-sm font-semibold md:justify-end">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`inline-flex items-center gap-1.5 ${item.className} transition-colors duration-200 hover:text-red-600`}
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