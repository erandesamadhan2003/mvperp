import { createElement, type ReactNode } from "react";
import {
    BadgeCheck,
    Briefcase,
    BookOpen,
    CalendarDays,
    ClipboardList,
    FileText,
    GraduationCap,
    Home,
    Landmark,
    Library,
    Settings,
    UserRound,
    Users,
    Wallet,
    type LucideIcon,
} from "lucide-react";
import type { MenuItem } from "@/core/types/auth.types";
import { RoleId } from "@/core/utils/constant";

const ROLE_PREFIX_RE = /^\/(admin|faculty|student)(?=\/|$)/i;

const FACULTY_STATIC_PATHS = [
    "/faculty",
    "/faculty/admission/StudentSubject-info",
    "/faculty/admission/university-id",
    "/faculty/approval/admission-confirm",
    "/faculty/approval/merit-approval",
    "/faculty/approval/merit-reg-student-info",
    "/faculty/approval/xi-govt-merit-students",
    "/faculty/dashboardAdmission/dashboard-admission",
    "/faculty/eLearning/teacherSchedule/class-lecture-summary",
    "/faculty/eLearning/teacherSchedule/home-work-summary",
    "/faculty/eLearning/teacherSchedule/StudentAttendance-Report",
    "/faculty/eLearning/teacherSchedule/teacher-time-table",
    "/faculty/employeeMaster/EmpConfidentiality",
    "/faculty/employeeMaster/EmpInfo",
    "/faculty/employeeMaster/EmpServiceRequest",
    "/faculty/institute/add-employee",
    "/faculty/libraryMaster/MemberClearance-master",
    "/faculty/librarySearch/opac-search",
    "/faculty/reports/students-list-report",
    "/faculty/salaryReports/Salary-employee-report",
] as const;

const STUDENT_STATIC_PATHS = [
    "/student",
    "/student/EntranceExam/Entrance-list",
    "/student/EntranceExam/EntranceApplication",
    "/student/libraryMaster/MemberClearance-master",
    "/student/libraryMaster/ReadingAttend-master",
    "/student/librarySearch/opac-search",
    "/student/payment-gateway/admission-payment-gateway",
    "/student/payment-gateway/dues-payment",
    "/student/payment-gateway/ExamFee-payment",
    "/student/payment-gateway/student-payment-details",
    "/student/registration/e-campus-course-enrollment",
    "/student/registration/e-campus-enrollment-list",
    "/student/registration/e-campus-student-profile",
    "/student/studentSchedule/student-home-work",
    "/student/studentSchedule/student-time-table",
    "/student/studentSchedule/today-lecture",
    "/student/UnivsersityResult/ExamForm-Info",
] as const;

const normalizePathname = (pathname: string): string => {
    if (!pathname) {
        return "/";
    }

    const collapsed = pathname.replace(/\/+$/g, "").replace(/\/+/g, "/");
    return collapsed || "/";
};

const splitPathSuffix = (href: string): [string, string] => {
    const index = href.search(/[?#]/);
    if (index < 0) {
        return [href, ""];
    }

    return [href.slice(0, index), href.slice(index)];
};

const buildCanonicalPathMap = (paths: readonly string[]): Map<string, string> => {
    const map = new Map<string, string>();
    paths.forEach((path) => {
        map.set(path.toLowerCase(), path);
    });
    return map;
};

const FACULTY_CANONICAL_MAP = buildCanonicalPathMap(FACULTY_STATIC_PATHS);
const STUDENT_CANONICAL_MAP = buildCanonicalPathMap(STUDENT_STATIC_PATHS);

const resolveStaticHrefForRole = (href: string, roleId: number): string => {
    const canonicalMap =
        roleId === RoleId.Faculty
            ? FACULTY_CANONICAL_MAP
            : roleId === RoleId.Student
                ? STUDENT_CANONICAL_MAP
                : null;

    if (!canonicalMap) {
        return href;
    }

    const [pathname, suffix] = splitPathSuffix(href);
    const normalizedPathname = normalizePathname(pathname);
    const canonicalPath = canonicalMap.get(normalizedPathname.toLowerCase());

    return `${canonicalPath ?? normalizedPathname}${suffix}`;
};

export const normalizeMenuHref = (formLink: string): string | null => {
    let value = formLink.trim();
    if (!value || value === "#") {
        return null;
    }

    if (value.startsWith("~/")) {
        value = value.slice(1);
    }

    if (value.startsWith("#/")) {
        value = value.slice(1);
    }

    if (/^https?:\/\//i.test(value)) {
        return value;
    }

    if (!value.startsWith("/")) {
        value = `/${value}`;
    }

    return value.replace(/\/+/g, "/");
};

export type MenuIconKey =
    | "home"
    | "admission"
    | "approval"
    | "finance"
    | "library"
    | "employee"
    | "student"
    | "faculty"
    | "result"
    | "settings"
    | "calendar"
    | "book"
    | "profile"
    | "default";

export const getMenuIconKey = (item: MenuItem): MenuIconKey => {
    const source = `${item.MenuName} ${item.CSSClass} ${item.NgClass}`.toLowerCase();

    if (source.includes("home") || source.includes("dashboard")) {
        return "home";
    }

    if (source.includes("admission") || source.includes("enrollment") || source.includes("entrance")) {
        return "admission";
    }

    if (source.includes("approval") || source.includes("confirm") || source.includes("merit")) {
        return "approval";
    }

    if (source.includes("payment") || source.includes("dues") || source.includes("salary") || source.includes("fee")) {
        return "finance";
    }

    if (source.includes("library") || source.includes("opac") || source.includes("reading")) {
        return "library";
    }

    if (source.includes("employee") || source.includes("emp") || source.includes("service")) {
        return "employee";
    }

    if (source.includes("student")) {
        return "student";
    }

    if (source.includes("faculty") || source.includes("staff") || source.includes("employee")) {
        return "faculty";
    }

    if (source.includes("result") || source.includes("report")) {
        return "result";
    }

    if (source.includes("setting") || source.includes("config")) {
        return "settings";
    }

    if (source.includes("calendar") || source.includes("schedule") || source.includes("time")) {
        return "calendar";
    }

    if (source.includes("book") || source.includes("course") || source.includes("subject") || source.includes("library")) {
        return "book";
    }

    if (source.includes("profile") || source.includes("user")) {
        return "profile";
    }

    return "default";
};

const ICON_BY_KEY: Record<MenuIconKey, LucideIcon> = {
    home: Home,
    admission: Landmark,
    approval: BadgeCheck,
    finance: Wallet,
    library: Library,
    employee: Briefcase,
    student: GraduationCap,
    faculty: Users,
    result: ClipboardList,
    settings: Settings,
    calendar: CalendarDays,
    book: BookOpen,
    profile: UserRound,
    default: FileText,
};

export const renderMenuIcon = (item: MenuItem): ReactNode => {
    const Icon = ICON_BY_KEY[getMenuIconKey(item)] ?? FileText;
    return createElement(Icon, {
        className: "h-[1.05rem] w-[1.05rem] shrink-0",
        "aria-hidden": "true",
    });
};

export const getRoleRoute = (roleId: number): string => {
    if (roleId === RoleId.Admin) {
        return "/admin";
    }

    if (roleId === RoleId.Faculty) {
        return "/faculty";
    }

    return "/student";
};

export const mapMenuHrefByRole = (formLink: string, roleId: number): string | null => {
    const href = normalizeMenuHref(formLink);
    if (!href || /^https?:\/\//i.test(href)) {
        return href;
    }

    const roleRoute = getRoleRoute(roleId);
    if (href === "/") {
        return roleRoute;
    }

    const strippedRolePrefix = href.replace(ROLE_PREFIX_RE, "");
    const normalizedSuffix = strippedRolePrefix.startsWith("/")
        ? strippedRolePrefix
        : `/${strippedRolePrefix}`;
    const roleHref = `${roleRoute}${normalizedSuffix}`.replace(/\/+/g, "/");

    return resolveStaticHrefForRole(roleHref, roleId);
};

export const buildHierarchicalMenu = (flatMenuList: MenuItem[]): MenuItem[] => {
    if (!flatMenuList || flatMenuList.length === 0) {
        return [];
    }

    const menuMap = new Map<number, MenuItem>();
    const rootMenus: MenuItem[] = [];

    flatMenuList.forEach((menu) => {
        const menuCopy: MenuItem = {
            ...menu,
            Childrens: [],
        };
        menuMap.set(menu.MenuIdentity, menuCopy);
    });

    flatMenuList.forEach((menu) => {
        const menuCopy = menuMap.get(menu.MenuIdentity)!;

        if (menu.ParentMenuId === null || menu.ParentMenuId === 0) {
            // Root menu item
            rootMenus.push(menuCopy);
        } else {
            const parent = menuMap.get(menu.ParentMenuId);
            if (parent) {
                if (!parent.Childrens) {
                    parent.Childrens = [];
                }
                parent.Childrens.push(menuCopy);
            }
        }
    });

    const sortByMenuNumber = (items: MenuItem[]) => {
        return items.sort((a, b) => (a.MenuNumber || 0) - (b.MenuNumber || 0));
    };

    rootMenus.forEach((root) => {
        if (root.Childrens && root.Childrens.length > 0) {
            root.Childrens = sortByMenuNumber(root.Childrens);
        }
    });

    return sortByMenuNumber(rootMenus);
};