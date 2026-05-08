import type { GridColumn } from "../types/column.types";

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

function toDate(value: unknown): Date | null {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === "string") {
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    return null;
}

function formatDDMMYYYY(date: Date): string {
    const dd = pad2(date.getDate());
    const mm = pad2(date.getMonth() + 1);
    const yyyy = String(date.getFullYear());
    return `${dd}/${mm}/${yyyy}`;
}

/**
 * Formats a raw cell value for read-only display based on the column type.
 *
 * @param value The raw value stored in the row.
 * @param column Column definition that controls formatting.
 * @returns A string suitable for cell display.
 */
export function formatCellValue(value: unknown, column: GridColumn): string {
    switch (column.type) {
        case "number": {
            if (value === null || value === undefined) return "";
            const n = typeof value === "number" ? value : Number(value);
            if (!Number.isFinite(n)) return "";
            return n.toLocaleString(undefined, {
                maximumFractionDigits: 2
            });
        }

        case "calendar": {
            const date = toDate(value);
            return date ? formatDDMMYYYY(date) : "";
        }

        case "select":
        case "dropdown": {
            const options = column.options ?? [];
            const found = options.find(o => o.value === (value as any));
            if (found) return found.label;
            return String(value ?? "");
        }

        case "dialog":
            return String(value ?? "");

        default:
            return String(value ?? "");
    }
}

/**
 * Estimates whether a string value will be truncated within a fixed-width column.
 *
 * This is used to decide if a native `title` tooltip should be shown.
 *
 * @param value Rendered string value.
 * @param columnWidth Width of the column in pixels.
 * @param charWidthEstimate Estimated average character width in pixels.
 * @returns True when the value likely exceeds the available width.
 */
export function isCellTruncated(value: string, columnWidth: number, charWidthEstimate = 7.5): boolean {
    return value.length * charWidthEstimate > columnWidth - 8;
}
