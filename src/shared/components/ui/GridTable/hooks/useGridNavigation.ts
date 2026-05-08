import { useCallback, useState } from "react";

import type { GridColumn } from "../types/column.types";
import type { CellCoord, CellState } from "../types/cell.types";
import type { NavigationDirection, NavigationOptions } from "../types/navigation.types";

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(value, max));
}

/**
 * Tracks active/editing cell state and provides Excel-like keyboard navigation.
 *
 * Behavior highlights:
 * - `active` is the focused cell.
 * - `editing` is the cell currently in edit mode (often the same as `active`).
 * - Moving via Tab/Arrows/Enter updates `active` and (when allowed) starts editing
 *   immediately so the next cell can be typed into without an extra click.
 * - `escape` exits edit mode without changing focus.
 */
export function useGridNavigation(columns: GridColumn[], pageData: unknown[], options?: NavigationOptions) {
    const [cellState, setCellState] = useState<CellState>({ active: null, editing: null });

    const isReadOnlyCol = useCallback((colIndex: number) => {
        return Boolean(columns[colIndex]?.readOnly);
    }, [columns]);

    /**
     * Sets the focused cell (`active`) and exits edit mode.
     *
     * This mirrors spreadsheet behavior: clicking/activating a cell does not
     * necessarily mean you are editing it.
     */
    const setActive = useCallback((coord: CellCoord | null) => {
        setCellState({ active: coord, editing: null });
    }, []);

    /**
     * Enters edit mode for a cell, unless the target column is read-only.
     *
     * - If `coord` is null, edit mode is cleared.
     * - If the target column is read-only, edit mode is cleared.
     */
    const setEditing = useCallback(
        (coord: CellCoord | null) => {
            if (coord === null) {
                setCellState(prev => ({ ...prev, editing: null }));
                return;
            }

            if (isReadOnlyCol(coord.colIndex)) {
                setCellState(prev => ({ ...prev, editing: null }));
                return;
            }

            setCellState(prev => ({ ...prev, editing: coord }));
        },
        [isReadOnlyCol]
    );

    /**
     * Moves focus/editing based on a keyboard navigation intent.
     *
     * Rules:
     * - Tab / Right: move to next column.
     * - ShiftTab / Left: move to previous column.
     * - Down / Up: move between rows.
     * - Enter: move down one row (same column).
     * - Escape: exit edit mode only.
     * - Optional wrap: Tab at last column wraps to col 0 of next row.
     * - Optional read-only skipping: Tab/Left/Right skips read-only columns.
     * - After any navigation (except Escape), edit mode is entered immediately
     *   if the destination column is not read-only.
     */
    const goTo = useCallback(
        (direction: NavigationDirection) => {
            setCellState(prev => {
                if (!prev.active) return prev;
                if (columns.length === 0 || pageData.length === 0) return prev;

                if (direction === "escape") {
                    return { ...prev, editing: null };
                }

                const { rowIndex, colIndex } = prev.active;
                let nextRow = rowIndex;
                let nextCol = colIndex;

                if (direction === "tab" || direction === "right") nextCol += 1;
                else if (direction === "shiftTab" || direction === "left") nextCol -= 1;
                else if (direction === "down") nextRow += 1;
                else if (direction === "up") nextRow -= 1;
                else if (direction === "enter") nextRow += 1;

                if (options?.wrapRows && direction === "tab" && nextCol >= columns.length) {
                    nextCol = 0;
                    nextRow += 1;
                }

                nextRow = clamp(nextRow, 0, pageData.length - 1);
                nextCol = clamp(nextCol, 0, columns.length - 1);

                if (options?.skipReadOnly) {
                    const horizontalStep =
                        direction === "left" || direction === "shiftTab" ? -1 : direction === "right" || direction === "tab" ? 1 : 0;

                    if (horizontalStep !== 0) {
                        let guard = 0;
                        while (guard < columns.length && isReadOnlyCol(nextCol)) {
                            nextCol += horizontalStep;

                            if (options.wrapRows && direction === "tab" && nextCol >= columns.length) {
                                nextCol = 0;
                                nextRow = clamp(nextRow + 1, 0, pageData.length - 1);
                            }

                            nextCol = clamp(nextCol, 0, columns.length - 1);
                            guard += 1;
                        }
                    }
                }

                const nextCoord: CellCoord = { rowIndex: nextRow, colIndex: nextCol };

                return {
                    active: nextCoord,
                    editing: isReadOnlyCol(nextCoord.colIndex) ? null : nextCoord
                };
            });
        },
        [columns.length, isReadOnlyCol, options?.skipReadOnly, options?.wrapRows, pageData.length]
    );

    return { cellState, setActive, setEditing, goTo };
}