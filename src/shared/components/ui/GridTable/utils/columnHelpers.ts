import type * as React from "react";

import type { GridColumn } from "../types/column.types";

const DEFAULT_WIDTH = 120;

function getWidthPx(colKey: string, widths: Map<string, number>) {
    return widths.get(colKey) ?? DEFAULT_WIDTH;
}

/**
 * Computes left offsets (in px) for fixed columns.
 *
 * Iterates `columns` in order and considers only those where `column.fixed === true`.
 * The first fixed column gets `left = 0`, the next gets `left = width(first)`, etc.
 *
 * @param columns Grid columns.
 * @param widths Map of column key -> width in pixels.
 * @returns Map of fixed column key -> CSS left offset in pixels.
 */
export function getFixedColumnOffsets(
    columns: GridColumn[],
    widths: Map<string, number>
): Map<string, number> {
    const offsets = new Map<string, number>();
    let left = 0;

    for (const col of columns) {
        if (!col.fixed) continue;
        offsets.set(col.key, left);
        left += getWidthPx(col.key, widths);
    }

    return offsets;
}

/**
 * Computes the total width (in px) of all fixed columns.
 *
 * @param columns Grid columns.
 * @param widths Map of column key -> width in pixels.
 * @returns Sum of widths for columns where `fixed === true`.
 */
export function getTotalFixedWidth(columns: GridColumn[], widths: Map<string, number>): number {
    let total = 0;
    for (const col of columns) {
        if (!col.fixed) continue;
        total += getWidthPx(col.key, widths);
    }
    return total;
}

/**
 * Computes the inline style for a column cell.
 *
 * Width is enforced with both `width` and `minWidth` so layout is stable.
 * For fixed columns, sticky positioning is applied using the precomputed offset.
 *
 * @param col Column definition.
 * @param widths Map of column key -> width in pixels.
 * @param offsets Map of fixed column key -> left offset in pixels.
 * @returns CSSProperties for the cell.
 */
export function getColumnStyle(
    col: GridColumn,
    widths: Map<string, number>,
    offsets: Map<string, number>
): React.CSSProperties {
    const widthPx = getWidthPx(col.key, widths);

    const style: React.CSSProperties = {
        width: `${widthPx}px`,
        minWidth: `${widthPx}px`
    };

    if (col.fixed) {
        const left = offsets.get(col.key) ?? 0;
        style.position = "sticky";
        style.left = `${left}px`;
        style.zIndex = 2;
    }

    return style;
}

/**
 * Splits columns into fixed and scrollable groups.
 *
 * Rules:
 * - Prefer explicit `fixed: true` markers.
 * - Only the first two fixed columns are treated as fixed.
 * - If fewer than two columns are explicitly fixed, the first `min(2, columns.length)`
 *   columns are treated as fixed automatically (without mutating the input objects).
 *
 * @param columns Grid columns.
 * @returns Object containing `fixed` (max 2) and `scrollable` columns.
 */
export function splitFixedScrollColumns(
    columns: GridColumn[]
): { fixed: GridColumn[]; scrollable: GridColumn[] } {
    const explicitFixed: GridColumn[] = [];
    const explicitScrollable: GridColumn[] = [];

    for (const col of columns) {
        if (col.fixed) explicitFixed.push(col);
        else explicitScrollable.push(col);
    }

    const fixed: GridColumn[] = [];
    const scrollable: GridColumn[] = [];

    if (explicitFixed.length >= 2) {
        fixed.push(...explicitFixed.slice(0, 2));
        scrollable.push(...explicitFixed.slice(2), ...explicitScrollable);
        return { fixed, scrollable };
    }

    // Fewer than 2 explicitly fixed: treat first N columns as fixed.
    const autoFixedCount = Math.min(2, columns.length);
    fixed.push(...columns.slice(0, autoFixedCount).map(col => ({ ...col, fixed: true })));
    scrollable.push(...columns.slice(autoFixedCount));
    return { fixed, scrollable };
}
