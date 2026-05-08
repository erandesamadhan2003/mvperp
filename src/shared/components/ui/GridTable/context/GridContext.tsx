import * as React from "react";

import type { CellChangeEvent, CellCoord, CellState } from "../types/cell.types";
import type { GridColumn } from "../types/column.types";
import type { NavigationDirection, NavigationOptions } from "../types/navigation.types";
import type { PaginationState } from "../types/pagination.types";

/**
 * Shared React context contract for GridTable state and actions.
 *
 * This context centralizes column definitions, data slices, pagination and
 * navigation state, plus imperative actions (edit/commit/navigate/resize) so
 * GridTable subcomponents can coordinate without prop drilling.
 */
export interface GridContextValue<TRow = Record<string, unknown>> {
    /**
     * Column definitions for the grid.
     */
    columns: GridColumn<TRow>[];

    /**
     * Current page slice of rows that are visible/rendered.
     */
    pageData: TRow[];

    /**
     * Full dataset (unpaginated), used for export or bulk operations.
     */
    allData: TRow[];

    /**
     * Active/editing cell coordinates.
     */
    cellState: CellState;

    /**
     * Pagination information (page, pageSize, total).
     */
    pagination: PaginationState;

    /**
     * Page size options shown in pagination UI.
     */
    pageSizeOptions: number[];

    /**
     * Column width map where the key is `column.key` and the value is pixel width.
     */
    columnWidths: Map<string, number>;

    /**
     * Per-cell validation errors keyed by `${rowIndex}-${colIndex}` (page-relative).
     */
    cellErrors: Map<string, string>;

    /**
     * Keyboard navigation configuration used by the grid.
     */
    navigationOptions?: NavigationOptions;

    /**
     * Sets the currently active (focused) cell.
     */
    setActive: (coord: CellCoord | null) => void;

    /**
     * Sets the cell currently being edited.
     */
    setEditing: (coord: CellCoord | null) => void;

    /**
     * Commits a cell value change to the underlying data store.
     */
    commitChange: (event: CellChangeEvent) => void;

    /**
     * Moves focus/editing according to a navigation direction.
     */
    goTo: (direction: NavigationDirection) => void;

    /**
     * Updates the current page number.
     */
    setPage: (page: number) => void;

    /**
     * Updates the current page size.
     */
    setPageSize: (size: number) => void;

    /**
     * Begins a column resize interaction.
     * @param colKey Column key to resize.
     * @param startX Starting pointer X coordinate in pixels.
     */
    startColumnResize: (colKey: string, startX: number) => void;
}

/**
 * React context instance for GridTable.
 */
export const GridContext = React.createContext<GridContextValue<any> | null>(null);
