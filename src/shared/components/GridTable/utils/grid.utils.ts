/**
 * Grid utility functions for GridTable data handling
 * Pure functions for grid operations, normalization, and state management
 */
import type { GridRowData, GridColumn } from '@/shared/components/GridTable/types/grid.types';

/**
 * Generates a unique row key
 */
export function generateRowKey(
    rowData: GridRowData,
    index: number,
    customKeyGenerator?: (rowData: GridRowData, index: number) => string
): string {
    if (customKeyGenerator) {
        return customKeyGenerator(rowData, index);
    }

    // Use id if available and unique
    if (rowData.id) {
        return `row-${rowData.id}`;
    }

    // Fallback to index-based key
    return `row-index-${index}`;
}

/**
 * Normalizes grid data - ensures all rows have proper structure
 */
export function normalizeGridData<T extends Record<string, any>>(
    data: any[],
    customKeyGenerator?: (rowData: GridRowData<T>, index: number) => string
): GridRowData<T>[] {
    return data.map((item, index) => {
        // Already normalized
        if (item && typeof item === 'object' && 'id' in item && 'data' in item) {
            return item as GridRowData<T>;
        }

        // Normalize from flat data object
        return {
            id: item?.id ?? index,
            data: item as T,
            selected: false,
            disabled: false,
        };
    });
}

/**
 * Calculates column widths based on content and constraints
 */
export function calculateColumnWidth(
    column: GridColumn,
    contentLength?: number,
    availableWidth?: number
): number {
    // Explicit width takes precedence
    if (column.width) {
        return column.width;
    }

    const minWidth = column.minWidth || 50;
    const maxWidth = column.maxWidth || availableWidth || 500;

    // Estimate width from title length if no custom width
    const estimatedWidth = Math.max(
        (column.title?.length || 0) * 8 + 32,
        50
    );

    return Math.min(Math.max(estimatedWidth, minWidth), maxWidth);
}

/**
 * Gets total grid width from columns
 */
export function calculateTotalGridWidth(
    columns: GridColumn[],
    gap?: number
): number {
    const columnWidths = columns.reduce((sum, col) => {
        return sum + (calculateColumnWidth(col) || 100);
    }, 0);

    return columnWidths + (columns.length - 1) * (gap || 0);
}

/**
 * Filters visible columns (excludes hidden ones)
 */
export function getVisibleColumns(columns: GridColumn[]): GridColumn[] {
    return columns.filter((col) => !col.hidden);
}

/**
 * Gets visible row data
 */
export function getVisibleRows<T>(
    rows: GridRowData<T>[],
    filter?: (row: GridRowData<T>, index: number) => boolean
): GridRowData<T>[] {
    if (!filter) {
        return rows;
    }

    return rows.filter(filter);
}

/**
 * Prepares row data for rendering - applies all filters and transformations
 */
export function prepareVisibleRows<T>(
    data: GridRowData<T>[],
    columns: GridColumn[],
    options?: {
        hideDisabled?: boolean;
        rowFilter?: (row: GridRowData<T>, index: number) => boolean;
    }
): Array<{ row: GridRowData<T>; index: number }> {
    const result: Array<{ row: GridRowData<T>; index: number }> = [];

    data.forEach((row, index) => {
        // Skip disabled rows if configured
        if (options?.hideDisabled && row.disabled) {
            return;
        }

        // Apply custom filter
        if (options?.rowFilter && !options.rowFilter(row, index)) {
            return;
        }

        result.push({ row, index });
    });

    return result;
}

/**
 * Updates row data immutably
 */
export function updateRowData<T extends Record<string, any>>(
    rows: GridRowData<T>[],
    rowIndex: number,
    updates: Partial<GridRowData<T>>
): GridRowData<T>[] {
    return rows.map((row, index) => {
        if (index === rowIndex) {
            return { ...row, ...updates };
        }
        return row;
    });
}

/**
 * Updates multiple rows immutably
 */
export function updateMultipleRows<T extends Record<string, any>>(
    rows: GridRowData<T>[],
    updates: Array<{ index: number; data: Partial<GridRowData<T>> }>
): GridRowData<T>[] {
    const updateMap = new Map(updates.map((u) => [u.index, u.data]));

    return rows.map((row, index) => {
        const rowUpdates = updateMap.get(index);
        if (rowUpdates) {
            return { ...row, ...rowUpdates };
        }
        return row;
    });
}

/**
 * Adds row to grid data
 */
export function addRow<T extends Record<string, any>>(
    rows: GridRowData<T>[],
    newRow: GridRowData<T>,
    position?: 'top' | 'bottom' | number
): GridRowData<T>[] {
    if (position === 'top') {
        return [newRow, ...rows];
    }

    if (position === 'bottom' || position === undefined) {
        return [...rows, newRow];
    }

    if (typeof position === 'number') {
        const result = [...rows];
        result.splice(position, 0, newRow);
        return result;
    }

    return [...rows, newRow];
}

/**
 * Removes row from grid data
 */
export function removeRow<T>(
    rows: GridRowData<T>[],
    rowIndex: number
): GridRowData<T>[] {
    return rows.filter((_, index) => index !== rowIndex);
}

/**
 * Removes multiple rows
 */
export function removeMultipleRows<T>(
    rows: GridRowData<T>[],
    indices: number[]
): GridRowData<T>[] {
    const indicesToRemove = new Set(indices);
    return rows.filter((_, index) => !indicesToRemove.has(index));
}

/**
 * Gets row by ID
 */
export function getRowById<T>(
    rows: GridRowData<T>[],
    rowId: string | number
): GridRowData<T> | undefined {
    return rows.find((row) => row.id === rowId);
}

/**
 * Gets row index by ID
 */
export function getRowIndexById<T>(
    rows: GridRowData<T>[],
    rowId: string | number
): number {
    return rows.findIndex((row) => row.id === rowId);
}

/**
 * Gets column by key
 */
export function getColumnByKey(
    columns: GridColumn[],
    columnKey: string
): GridColumn | undefined {
    return columns.find((col) => col.key === columnKey);
}

/**
 * Gets column index by key
 */
export function getColumnIndexByKey(
    columns: GridColumn[],
    columnKey: string
): number {
    return columns.findIndex((col) => col.key === columnKey);
}

/**
 * Sorts rows by column
 */
export function sortRows<T extends Record<string, any>>(
    rows: GridRowData<T>[],
    columnKey: string,
    direction: 'asc' | 'desc' = 'asc'
): GridRowData<T>[] {
    const sorted = [...rows].sort((a, b) => {
        const aVal = a.data?.[columnKey];
        const bVal = b.data?.[columnKey];

        if (aVal === bVal) return 0;
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        return direction === 'asc' ? 1 : -1;
    });

    return sorted;
}

/**
 * Filters rows by a predicate function
 */
export function filterRows<T>(
    rows: GridRowData<T>[],
    predicate: (row: GridRowData<T>, index: number) => boolean
): GridRowData<T>[] {
    return rows.filter(predicate);
}

/**
 * Paginates rows
 */
export function paginateRows<T>(
    rows: GridRowData<T>[],
    page: number,
    pageSize: number
): {
    rows: GridRowData<T>[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
} {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedRows = rows.slice(start, end);
    const totalPages = Math.ceil(rows.length / pageSize);

    return {
        rows: paginatedRows,
        total: rows.length,
        page,
        pageSize,
        totalPages,
    };
}

/**
 * Gets summary of grid data
 */
export function getGridSummary<T extends Record<string, any>>(
    data: GridRowData<T>[],
    columns: GridColumn[]
): {
    totalRows: number;
    totalCols: number;
    visibleCols: number;
    selectedCount: number;
    disabledCount: number;
} {
    return {
        totalRows: data.length,
        totalCols: columns.length,
        visibleCols: columns.filter((c) => !c.hidden).length,
        selectedCount: data.filter((r) => r.selected).length,
        disabledCount: data.filter((r) => r.disabled).length,
    };
}

/**
 * Checks if all rows are selected
 */
export function areAllRowsSelected<T>(
    rows: GridRowData<T>[],
    totalRows?: number
): boolean {
    const total = totalRows ?? rows.length;
    const selectedCount = rows.filter((r) => r.selected).length;
    return total > 0 && selectedCount === total;
}

/**
 * Toggles all rows selection
 */
export function toggleSelectAllRows<T>(
    rows: GridRowData<T>[],
    selectAll: boolean
): GridRowData<T>[] {
    return rows.map((row) => ({
        ...row,
        selected: selectAll,
    }));
}

/**
 * Extracts selected row data
 */
export function getSelectedRowsData<T extends Record<string, any>>(
    rows: GridRowData<T>[]
): Array<{ row: GridRowData<T>; index: number }> {
    return rows.reduce<Array<{ row: GridRowData<T>; index: number }>>(
        (acc, row, index) => {
            if (row.selected) {
                acc.push({ row, index });
            }
            return acc;
        },
        []
    );
}

/**
 * Exports grid data as CSV (simple implementation)
 */
export function exportGridDataToCSV<T extends Record<string, any>>(
    columns: GridColumn[],
    rows: GridRowData<T>[],
    filename?: string
): void {
    // Header row
    const headers = columns.map((col) => `"${col.title.replace(/"/g, '""')}"`).join(',');

    // Data rows
    const dataRows = rows.map((row) =>
        columns
            .map((col) => {
                const value = row.data?.[col.key] ?? '';
                return `"${String(value).replace(/"/g, '""')}"`;
            })
            .join(',')
    );

    const csv = [headers, ...dataRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename || 'grid-export.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
