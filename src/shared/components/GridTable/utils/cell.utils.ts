/**
 * Cell utility functions for spreadsheet/grid cell operations
 * Pure functions for cell value manipulation and validation
 */
import type { GridRowData, GridColumn, GridCellPosition, GridChangeEvent } from '@/shared/components/GridTable/types/grid.types';

/**
 * Updates a cell value in a row immutably
 * Returns new row with updated cell value
 */
export function updateCellValue<T extends Record<string, any>>(
    rowData: GridRowData<T>,
    columnKey: string,
    newValue: any
): GridRowData<T> {
    return {
        ...rowData,
        data: {
            ...rowData.data,
            [columnKey]: newValue,
        },
    };
}

/**
 * Gets cell value from row data
 */
export function getCellValue<T extends Record<string, any>>(
    rowData: GridRowData<T>,
    columnKey: string
): any {
    return rowData.data?.[columnKey] ?? null;
}

/**
 * Formats cell value for display
 * Handles null, undefined, and type-specific formatting
 */
export function formatCellValue(value: any, dataType?: string): string {
    if (value === null || value === undefined) {
        return '';
    }

    switch (dataType) {
        case 'date':
            return value instanceof Date
                ? value.toLocaleDateString()
                : new Date(value).toLocaleDateString();

        case 'number':
            return typeof value === 'number' ? value.toString() : String(value);

        case 'boolean':
            return value ? 'Yes' : 'No';

        default:
            return String(value);
    }
}

/**
 * Parses cell input value to appropriate type
 */
export function parseCellValue(value: any, dataType?: string): any {
    if (value === '' || value === null || value === undefined) {
        return null;
    }

    switch (dataType) {
        case 'number':
            const num = parseFloat(String(value));
            return isNaN(num) ? value : num;

        case 'boolean':
            if (typeof value === 'boolean') return value;
            return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());

        case 'date':
            const date = new Date(value);
            return isNaN(date.getTime()) ? value : date;

        default:
            return String(value);
    }
}

/**
 * Validates cell value according to column rules
 * Returns validation result with error message if invalid
 */
export function validateCellValue(
    value: any,
    column: GridColumn,
    rowData?: GridRowData
): { valid: boolean; error?: string } {
    // Handle required validation (future use)
    if (column.dataType === 'number' && value !== null && isNaN(parseFloat(value))) {
        return { valid: false, error: 'Invalid number' };
    }

    if (column.dataType === 'date' && value !== null) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return { valid: false, error: 'Invalid date' };
        }
    }

    return { valid: true };
}

/**
 * Compares two cell values for equality
 * Useful for detecting actual changes before sending onChange event
 */
export function isCellValueChanged(previousValue: any, newValue: any): boolean {
    // Handle null/undefined cases
    if (previousValue === newValue) {
        return false;
    }

    // Handle Date comparison
    if (previousValue instanceof Date && newValue instanceof Date) {
        return previousValue.getTime() !== newValue.getTime();
    }

    // Handle object comparison (deep equality not necessary for cell values)
    if (typeof previousValue === 'object' && typeof newValue === 'object') {
        return JSON.stringify(previousValue) !== JSON.stringify(newValue);
    }

    return true;
}

/**
 * Creates a change event object
 */
export function createChangeEvent<T extends Record<string, any>>(
    cellPosition: GridCellPosition,
    rowId: string | number,
    columnKey: string,
    previousValue: any,
    newValue: any,
    rowData: GridRowData<T>,
    rowIndex: number
): GridChangeEvent<T> {
    return {
        cellPosition,
        rowId,
        columnKey,
        previousValue,
        newValue,
        rowData,
        rowIndex,
    };
}

/**
 * Clones a row immutably
 */
export function cloneRowData<T extends Record<string, any>>(
    rowData: GridRowData<T>
): GridRowData<T> {
    return {
        ...rowData,
        data: { ...rowData.data },
    };
}

/**
 * Gets cell display value with custom renderer applied
 */
export function getCellDisplayValue(
    value: any,
    column: GridColumn,
    rowData: GridRowData,
    rowIndex: number
): React.ReactNode {
    if (column.renderCell) {
        return column.renderCell(value, rowData.data, rowIndex, column.key);
    }

    return formatCellValue(value, column.dataType);
}

/**
 * Checks if a cell is editable based on column and row configuration
 */
export function isCellEditable(
    column: GridColumn,
    rowData?: GridRowData,
    gridEditable?: boolean
): boolean {
    // Row disabled takes precedence
    if (rowData?.disabled) {
        return false;
    }

    // Column must be explicitly editable
    if (!column.editable) {
        return false;
    }

    // Grid must allow editing (if specified)
    if (gridEditable === false) {
        return false;
    }

    return true;
}

/**
 * Gets next editable cell in a row (moving right)
 */
export function getNextEditableCell(
    columns: GridColumn[],
    startColIndex: number,
    rowData?: GridRowData,
    gridEditable?: boolean
): number {
    for (let i = startColIndex + 1; i < columns.length; i++) {
        if (isCellEditable(columns[i], rowData, gridEditable)) {
            return i;
        }
    }
    return -1;
}

/**
 * Gets previous editable cell in a row (moving left)
 */
export function getPreviousEditableCell(
    columns: GridColumn[],
    startColIndex: number,
    rowData?: GridRowData,
    gridEditable?: boolean
): number {
    for (let i = startColIndex - 1; i >= 0; i--) {
        if (isCellEditable(columns[i], rowData, gridEditable)) {
            return i;
        }
    }
    return -1;
}