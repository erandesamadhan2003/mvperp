import type * as React from 'react';

/**
 * Supported editor/rendering modes for a GridTable column.
 */
export type ColumnType =
    | 'text'
    | 'number'
    | 'select'
    | 'dropdown'
    | 'calendar'
    | 'dialog';

/**
 * Represents a single option for select-like editors (e.g., select/dropdown).
 */
export interface SelectOption {
    /**
     * Human-readable label shown in the UI.
     */
    label: string;

    /**
     * Underlying value stored/committed by the editor.
     */
    value: string | number;
}

/**
 * Props contract for dialog-based cell editors.
 */
export interface DialogEditorProps {
    /**
     * Current cell value that the dialog editor should display/edit.
     */
    value: unknown;

    /**
     * Called to commit a new value back to the grid.
     * @param val The value to commit.
     */
    onCommit: (val: unknown) => void;

    /**
     * Called to close/dismiss the dialog editor without committing.
     */
    onClose: () => void;
}

/**
 * Column definition for the GridTable.
 *
 * @typeParam TRow - The row shape for the grid. Defaults to a generic record.
 */
export interface GridColumn<TRow = Record<string, unknown>> {
    /**
     * Field key in the row that this column reads/writes.
     * Constrained to string keys for safe mapping to DOM/data attributes.
     */
    key: keyof TRow & string;

    /**
     * Column header text displayed in the table header.
     */
    header: string;

    /**
     * Column editor/rendering type (e.g., text, select, calendar).
     */
    type: ColumnType;

    /**
     * Preferred column width in pixels.
     * If omitted, the grid should treat it as 120px by default.
     */
    width?: number;

    /**
     * Minimum allowed column width in pixels.
     * If omitted, the grid should treat it as 40px minimum.
     */
    minWidth?: number;

    /**
     * Maximum allowed column width in pixels.
     */
    maxWidth?: number;

    /**
     * Optional minimum value constraint for numeric editors.
     */
    min?: number;

    /**
     * Optional maximum value constraint for numeric editors.
     */
    max?: number;

    /**
     * When true, prevents editing of the cell value for this column.
     */
    readOnly?: boolean;

    /**
     * When true, the column should be rendered as sticky on the left.
     * Commonly used for the first 1–2 columns.
     */
    fixed?: boolean;

    /**
     * When true, allows sorting the grid by this column.
     */
    sortable?: boolean;

    /**
     * Options used by select-like editors.
     * Only meaningful for columns with type 'select' or 'dropdown'.
     */
    options?: SelectOption[];

    /**
     * Custom dialog editor component for columns with type 'dialog'.
     * The grid should render this component to edit the cell value.
     */
    dialogComponent?: React.ComponentType<DialogEditorProps>;

    /**
     * Optional custom cell renderer.
     * @param value The current value extracted from the row for this column.
     * @param row The full row object for additional context.
     * @returns A React node to render in the cell.
     */
    renderCell?: (value: unknown, row: TRow) => React.ReactNode;

    /**
     * Optional validator for edited values.
     * @param value The value to validate.
     * @returns An error message string when invalid, or null when valid.
     */
    validate?: (value: unknown) => string | null;
}
