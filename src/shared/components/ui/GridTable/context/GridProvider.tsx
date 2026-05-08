import * as React from "react";

import { GridContext } from "./GridContext";
import { useColumnResize } from "../hooks/useColumnResize";
import { useGridEdit } from "../hooks/useGridEdit";
import { useGridNavigation } from "../hooks/useGridNavigation";
import { usePagination } from "../hooks/usePagination";

import type { GridColumn } from "../types/column.types";
import type { NavigationOptions } from "../types/navigation.types";
import type { PaginationConfig } from "../types/pagination.types";

/**
 * Props for the GridTable provider.
 */
export interface GridProviderProps<TRow extends Record<string, unknown> = Record<string, unknown>> {
    /**
     * Column definitions for the grid.
     */
    columns: GridColumn<TRow>[];

    /**
     * Full dataset used by the grid.
     */
    data: TRow[];

    /**
     * Optional pagination configuration.
     */
    paginationConfig?: PaginationConfig;

    /**
     * Optional keyboard navigation configuration.
     */
    navigationOptions?: NavigationOptions;

    /**
     * Callback invoked when the grid commits data updates.
     */
    onDataChange?: (updatedData: TRow[]) => void;

    /**
     * Child components rendered inside the provider.
     */
    children: React.ReactNode;
}

/**
 * Provides GridTable state and actions via React context.
 */
export function GridProvider<TRow extends Record<string, unknown> = Record<string, unknown>>(
    props: GridProviderProps<TRow>
) {
    const { columns, data, paginationConfig, navigationOptions, onDataChange, children } = props;

    // 1) Pagination state
    const { pagination, pageSizeOptions, setPage, setPageSize } = usePagination(data.length, paginationConfig);

    // 2) Visible slice for current page
    const pageData = React.useMemo(() => {
        const start = (pagination.page - 1) * pagination.pageSize;
        const end = pagination.page * pagination.pageSize;
        return data.slice(start, end);
    }, [data, pagination.page, pagination.pageSize]);

    // 3) Keyboard navigation + cell state
    const { cellState, setActive, setEditing, goTo } = useGridNavigation(
        columns as unknown as GridColumn[],
        pageData as unknown[],
        navigationOptions
    );

    // 4) Column resizing
    const { widths: columnWidths, startResize: startColumnResize } = useColumnResize(columns as unknown as GridColumn[]);

    // 5) Edit/commit + validation errors
    const { commitChange, cellErrors } = useGridEdit<TRow>({
        data,
        pageData,
        pagination,
        onDataChange
    });

    const contextValue = React.useMemo(
        () => ({
            columns,
            pageData,
            allData: data,
            cellState,
            pagination,
            pageSizeOptions,
            columnWidths,
            cellErrors,
            navigationOptions,
            setActive,
            setEditing,
            commitChange,
            goTo,
            setPage,
            setPageSize,
            startColumnResize
        }),
        [
            columns,
            pageData,
            data,
            cellState,
            pagination,
            pageSizeOptions,
            columnWidths,
            cellErrors,
            navigationOptions,
            setActive,
            setEditing,
            commitChange,
            goTo,
            setPage,
            setPageSize,
            startColumnResize
        ]
    );

    return <GridContext.Provider value={contextValue}>{children}</GridContext.Provider>;
}
