import * as React from "react";

import { useGridContext } from "../context/useGridContext";
import { getCellValue } from "../utils/dataUtils";
import { GridCell } from "./GridCell";

import type { CellValue } from "../types/cell.types";
import type { GridColumn } from "../types/column.types";

/**
 * Props for a single grid row.
 */
export interface GridRowProps<TRow = Record<string, unknown>> {
    /**
     * Row index within the current page (0-based).
     */
    rowIndex: number;

    /**
     * Row data object.
     */
    row: TRow;

    /**
     * Column definitions.
     */
    columns: GridColumn[];

    /**
     * Optional style injected by parent (e.g., virtual scroll positioning).
     */
    style?: React.CSSProperties;
}

interface GridRowViewProps<TRow> extends GridRowProps<TRow> {
    /**
     * Current active row index (page-relative).
     */
    activeRowIndex: number | null;

    /**
     * Current editing row index (page-relative).
     */
    editingRowIndex: number | null;

    /**
     * Column width map from context.
     */
    columnWidths: Map<string, number>;

    /**
     * Per-cell validation errors map from context.
     */
    cellErrors: Map<string, string>;
}

/**
 * Memoized row view.
 *
 * Comparator rules:
 * - Re-render when row reference changes.
 * - Re-render when active row changes to/from this row.
 * - Re-render when editing row changes to/from this row.
 */
const GridRowView = React.memo(
    function GridRowViewInner<TRow = Record<string, unknown>>(props: GridRowViewProps<TRow>) {
        const { rowIndex, row, columns, style, activeRowIndex, columnWidths, cellErrors } = props;
        void columnWidths;
        void cellErrors;

        const isRowActive = activeRowIndex === rowIndex;

        const rowStyle: React.CSSProperties = {
            display: "flex",
            background: rowIndex % 2 === 0 ? "#ffffff" : "#fafafa",
            borderLeft: isRowActive ? "2px solid #0078d4" : "2px solid transparent",
            ...(style ?? {})
        };

        return (
            <div role="row" aria-rowindex={rowIndex + 2} style={rowStyle}>
                {columns.map((column, colIndex) => (
                    <GridCell
                        key={column.key}
                        rowIndex={rowIndex}
                        colIndex={colIndex}
                        column={column}
                        value={getCellValue(row as any, column.key) as CellValue}
                    />
                ))}
            </div>
        );
    },
    (prev, next) => {
        if (prev.row !== next.row) return false;

        const activeChangedForThisRow =
            (prev.activeRowIndex === prev.rowIndex && next.activeRowIndex !== prev.rowIndex) ||
            (prev.activeRowIndex !== prev.rowIndex && next.activeRowIndex === prev.rowIndex);

        const editingChangedForThisRow =
            (prev.editingRowIndex === prev.rowIndex && next.editingRowIndex !== prev.rowIndex) ||
            (prev.editingRowIndex !== prev.rowIndex && next.editingRowIndex === prev.rowIndex);

        return !(activeChangedForThisRow || editingChangedForThisRow);
    }
);

/**
 * GridRow component for GridTable.
 *
 * This component consumes GridContext to read cell state and forwards only the
 * active/editing row indices into a memoized row view. This keeps navigation and
 * editing changes from causing all rows to re-render.
 */
function GridRowInner<TRow = Record<string, unknown>>(props: GridRowProps<TRow>) {
    const { cellState, columnWidths, cellErrors } = useGridContext();

    const activeRowIndex = cellState.active?.rowIndex ?? null;
    const editingRowIndex = cellState.editing?.rowIndex ?? null;

    return (
        <GridRowView
            {...props}
            activeRowIndex={activeRowIndex}
            editingRowIndex={editingRowIndex}
            columnWidths={columnWidths}
            cellErrors={cellErrors}
        />
    );
}

/**
 * GridRow component for GridTable with memoization.
 */
export const GridRow = React.memo(GridRowInner) as <TRow = Record<string, unknown>>(
    props: GridRowProps<TRow>
) => React.JSX.Element;
