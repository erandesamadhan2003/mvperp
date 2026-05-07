
/**
 * Column alignment options
 */
export type ColumnAlign = 'left' | 'center' | 'right';

/**
 * Column pinned position
 */
export type ColumnPinned = 'left' | 'right' | false;

/**
 * Grid column definition
 * Supports dynamic columns with extensive customization options
 */
export interface GridColumn<T = any> {
    /** Unique column identifier */
    key: string;

    /** Display title for column header */
    title: string;

    /** Column width in pixels */
    width?: number;

    /** Minimum column width for resizing */
    minWidth?: number;

    /** Maximum column width for resizing */
    maxWidth?: number;

    /** Whether cells in this column are editable */
    editable?: boolean;

    /** Whether column is sortable */
    sortable?: boolean;

    /** Whether column width can be resized */
    resizable?: boolean;

    /** Pin column to left or right edge */
    pinned?: ColumnPinned;

    /** Text alignment within cells */
    align?: ColumnAlign;

    /** Custom renderer for header content */
    renderHeader?: (column: GridColumn<T>) => React.ReactNode;

    /** Custom renderer for cell content */
    renderCell?: (value: any, rowData: T, rowIndex: number, columnKey: string) => React.ReactNode;

    /** Data type hint for validation and formatting */
    dataType?: 'string' | 'number' | 'date' | 'boolean' | 'custom';

    /** CSS class name for column cells */
    className?: string;

    /** Hidden column (for future use) */
    hidden?: boolean;
}

/**
 * Grid row data with generic support
 * Allows any row structure while maintaining type safety
 */
export interface GridRowData<T = Record<string, any>> {
    /** Unique row identifier */
    id: string | number;

    /** Row data containing cell values */
    data: T;

    /** Whether row is selected */
    selected?: boolean;

    /** Whether row is disabled */
    disabled?: boolean;

    /** Custom row metadata */
    metadata?: Record<string, any>;
}

/**
 * Cell position on grid (row and column index)
 * Used for tracking active cell, selection state, and navigation
 */
export interface GridCellPosition {
    /** Row index in grid data array */
    rowIndex: number;

    /** Column index in columns array */
    colIndex: number;
}

/**
 * Grid selection state
 * Tracks selected cells and ranges for future multi-cell selection support
 */
export interface GridSelectionState {
    /** Currently focused/active cell position */
    activeCell: GridCellPosition | null;

    /** Selected cell positions (for future range selection) */
    selectedCells: GridCellPosition[];

    /** Selected row IDs (for future row selection) */
    selectedRows: (string | number)[];

    /** Start position of selection range (for future use) */
    rangeStart: GridCellPosition | null;

    /** End position of selection range (for future use) */
    rangeEnd: GridCellPosition | null;
}

/**
 * Grid editing state
 * Tracks which cell is being edited and its current value
 */
export interface GridEditingState {
    /** Current cell being edited */
    editingCell: GridCellPosition | null;

    /** Current editing value */
    editingValue: any;

    /** Whether currently in edit mode */
    isEditing: boolean;
}

/**
 * Grid change event data
 * Sent when cell value is updated
 */
export interface GridChangeEvent<T = any> {
    /** Affected cell position */
    cellPosition: GridCellPosition;

    /** Row ID being modified */
    rowId: string | number;

    /** Column key being modified */
    columnKey: string;

    /** Previous cell value */
    previousValue: any;

    /** New cell value */
    newValue: any;

    /** Complete updated row data */
    rowData: GridRowData<T>;

    /** Row index in data array */
    rowIndex: number;
}

/**
 * Main GridTable component props
 * Comprehensive configuration for enterprise-grade grid behavior and styling
 */
export interface GridTableProps<T = Record<string, any>> {
    /** Column definitions */
    columns: GridColumn<T>[];

    /** Row data to display */
    data: GridRowData<T>[];

    /** Callback when cell value changes */
    onChange?: (event: GridChangeEvent<T>) => void;

    /** Height of each row in pixels */
    rowHeight?: number;

    /** Height of header row in pixels */
    headerHeight?: number;

    /** Show loading state */
    loading?: boolean;

    /** Allow row selection */
    selectable?: boolean;

    /** Allow cell editing */
    editable?: boolean;

    /** CSS class name for root element */
    className?: string;

    /** CSS class name for table wrapper */
    wrapperClassName?: string;

    /** Unique identifier for the grid (used for ref tracking) */
    id?: string;

    /** Callback when active cell changes */
    onActiveCellChange?: (position: GridCellPosition | null) => void;

    /** Callback when selection changes */
    onSelectionChange?: (selection: GridSelectionState) => void;

    /** Virtualized rendering enabled */
    virtualized?: boolean;

    /** Overscan count for virtualization */
    overscan?: number;

    /** Enable keyboard navigation */
    keyboardNavigation?: boolean;

    /** Min width for horizontal scroll container */
    minWidth?: number;

    /** Row class name callback for dynamic styling */
    rowClassName?: (rowData: GridRowData<T>, rowIndex: number) => string;

    /** Cell class name callback for dynamic styling */
    cellClassName?: (value: any, rowData: GridRowData<T>, rowIndex: number, colIndex: number) => string;

    /** Row not found message */
    emptyMessage?: string;

    /** Show borders between cells */
    bordered?: boolean;

    /** Striped row styling */
    striped?: boolean;

    /** Hover highlight on rows */
    hoverable?: boolean;

    /** Compact styling */
    compact?: boolean;

    /** Custom row key generator */
    getRowKey?: (rowData: GridRowData<T>, index: number) => string;
}

/**
 * Grid context value exposed through GridProvider
 * Contains grid-wide state and utilities
 */
export interface GridContextValue {
    /** Current grid selection state */
    selection: GridSelectionState;

    /** Current grid editing state */
    editing: GridEditingState;

    /** Set active cell */
    setActiveCell: (position: GridCellPosition | null) => void;

    /** Update selection state */
    updateSelection: (selection: Partial<GridSelectionState>) => void;

    /** Start editing cell */
    startEditing: (position: GridCellPosition, value?: any) => void;

    /** Stop editing */
    stopEditing: () => void;

    /** Update editing value */
    setEditingValue: (value: any) => void;

    /** Clear selection */
    clearSelection: () => void;

    /** Grid columns for context access */
    columns: GridColumn[];

    /** Grid data for context access */
    data: GridRowData[];

    /** On change callback */
    onChange?: (event: GridChangeEvent) => void;

    /** Keyboard navigation enabled */
    keyboardNavigationEnabled?: boolean;
}

/**
 * Keyboard navigation event details
 * Used by keyboard navigation hook
 */
export interface KeyboardNavigationEvent {
    /** Which row to navigate to */
    targetRowIndex: number;

    /** Which column to navigate to */
    targetColIndex: number;

    /** Whether to start editing */
    startEdit?: boolean;

    /** Whether this is a selection movement */
    isSelection?: boolean;
}

/**
 * Virtual row calculation result
 * Used by virtualization hook
 */
export interface VirtualRowRange {
    /** First visible row index */
    startIndex: number;

    /** Last visible row index */
    endIndex: number;

    /** Offset for rendering visible items */
    offsetY: number;

    /** Total height of all items */
    totalHeight: number;

    /** Visible items with position info */
    visibleRanges: Array<{
        index: number;
        offset: number;
    }>;
}

/**
 * Keyboard event handler type
 */
export type KeyboardEventHandler = (
    event: React.KeyboardEvent<HTMLElement>,
    currentPosition: GridCellPosition | null,
    gridSize: { rows: number; cols: number }
) => void;

/**
 * Cell focus type
 */
export type CellFocusType = 'active' | 'selected' | 'editing' | 'none';