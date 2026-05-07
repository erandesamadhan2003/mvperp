export type ColumnType = | 'text' | 'number' | 'date' | 'boolean' | 'dropdown' | 'select' | 'checkbox' | 'radio';

export interface SelectOption {
    label: string;
    value: string | number | boolean;
}

export interface DialogEditorProps<TRow = Record<string, unknown>> {
    row: TRow;
    column: GridColumn<TRow>;
    value: unknown;
    onChange: (value: unknown) => void;
    onClose: () => void;
}

export interface GridColumn<TRow = Record<string, unknown>> {
    key: keyof TRow & string;
    header: string;
    type: ColumnType;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    readonly?: boolean;
    fixed?: boolean; // For fixed columns (sticky)
    sortable?: boolean;
    options?: SelectOption[]; // For dropdown, select, checkbox, radio types
    dialogComponent?: React.ComponentType<DialogEditorProps<TRow>>; // For dialog-based editing
    renderCell?: (value: unknown, row: TRow) => React.ReactNode; // Custom cell rendering
    validate?: (value: unknown) => string | null; // Returns error message or null if valid
}