import { useCallback, useMemo, useState } from "react";

import { useGridContext } from "../context/useGridContext";

import type { CellChangeEvent } from "../types/cell.types";
import type { GridColumn } from "../types/column.types";
import type { PaginationState } from "../types/pagination.types";

/**
 * Props for `useGridEdit`.
 */
export interface UseGridEditProps<TRow extends Record<string, unknown> = Record<string, unknown>> {
    /**
     * Full dataset for the grid.
     */
    data: TRow[];

    /**
     * Current page slice of the dataset.
     */
    pageData: TRow[];

    /**
     * Pagination state used to translate page-relative row indices to absolute indices.
     */
    pagination: PaginationState;

    /**
     * Callback invoked with the updated full dataset after a successful commit.
     */
    onDataChange?: (updatedData: TRow[]) => void;
}

/**
 * Handles cell commit logic for GridTable.
 *
 * Validation flow:
 * - On commit, this hook locates the column by `event.key` and runs `column.validate`
 *   (if present) against `event.newValue`.
 * - When validation fails (returns a non-null error string), the hook stores the
 *   error in `cellErrors` keyed by `${rowIndex}-${colIndex}` (page-relative) and
 *   exits early without mutating the data.
 *
 * Update pattern:
 * - Computes the absolute row index from pagination state.
 * - Produces a new array and a shallow-cloned row object to update a single field
 *   immutably, then calls `onDataChange(updatedData)`.
 */
export function useGridEdit<TRow extends Record<string, unknown> = Record<string, unknown>>(
    props: UseGridEditProps<TRow>
) {
    const { data, pagination, onDataChange } = props;

    // Columns are sourced from the GridContext so we can access `column.validate`.
    const { columns } = useGridContext<TRow>();

    const columnsByKey = useMemo(() => {
        const map = new Map<string, GridColumn<TRow>>();
        for (const col of columns) map.set(col.key, col);
        return map;
    }, [columns]);

    const [cellErrors, setCellErrors] = useState<Map<string, string>>(() => new Map());

    const clearError = useCallback((rowIndex: number, colIndex: number) => {
        const key = `${rowIndex}-${colIndex}`;
        setCellErrors(prev => {
            if (!prev.has(key)) return prev;
            const next = new Map(prev);
            next.delete(key);
            return next;
        });
    }, []);

    const commitChange = useCallback(
        (event: CellChangeEvent) => {
            const errorKey = `${event.rowIndex}-${event.colIndex}`;

            const column = columnsByKey.get(event.key);
            const validate = column?.validate;
            if (validate) {
                const validationError = validate(event.newValue);
                if (typeof validationError === "string" && validationError.length > 0) {
                    setCellErrors(prev => {
                        const next = new Map(prev);
                        next.set(errorKey, validationError);
                        return next;
                    });
                    return;
                }
            }

            // Clear any previous error once we have a valid commit attempt.
            setCellErrors(prev => {
                if (!prev.has(errorKey)) return prev;
                const next = new Map(prev);
                next.delete(errorKey);
                return next;
            });

            const absoluteRowIndex = (pagination.page - 1) * pagination.pageSize + event.rowIndex;
            if (absoluteRowIndex < 0 || absoluteRowIndex >= data.length) return;

            const currentRow = data[absoluteRowIndex];
            const updatedRow = {
                ...currentRow,
                [event.key]: event.newValue
            } as TRow;

            const updatedData = data.slice();
            updatedData[absoluteRowIndex] = updatedRow;
            onDataChange?.(updatedData);
        },
        [columnsByKey, data, onDataChange, pagination.page, pagination.pageSize]
    );

    return { commitChange, cellErrors, clearError };
}
