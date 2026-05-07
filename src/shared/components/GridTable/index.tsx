import './GridTable.css';

// Original components
export { GridTable } from './GridTable';
export { GridTableEnhanced } from './GridTableEnhanced';
export { GridHeader } from './GridHeader';
export { GridCell } from './GridCell';
export { GridRow } from './GridRow';

// Context and Provider
export {
    GridProvider,
    useGrid,
    useGridSelection,
    useGridEditing,
    useGridData,
} from './providers/GridProvider';

// Hooks
export { useGridFocus } from './hooks/useGridFocus';
export { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
export {
    useVirtualRow,
    useVirtualScroll,
    useVariableItemSize,
} from './hooks/useVirtualRowa';

// Types
export type {
    ColumnAlign,
    ColumnPinned,
    GridColumn,
    GridRowData,
    GridCellPosition,
    GridSelectionState,
    GridEditingState,
    GridChangeEvent,
    GridTableProps,
    GridContextValue,
    KeyboardNavigationEvent,
    VirtualRowRange,
    KeyboardEventHandler,
    CellFocusType,
} from './types/grid.types';

// Utilities
export {
    // Cell utilities
    updateCellValue,
    getCellValue,
    formatCellValue,
    parseCellValue,
    validateCellValue,
    isCellValueChanged,
    createChangeEvent,
    cloneRowData,
    getCellDisplayValue,
    isCellEditable,
    getNextEditableCell,
    getPreviousEditableCell,

    // Navigation utilities
    getNextCell,
    getPreviousCell,
    getCellAbove,
    getCellBelow,
    getTabCell,
    getShiftTabCell,
    getFirstCellInRow,
    getLastCellInRow,
    getFirstCellInColumn,
    getLastCellInColumn,
    getFirstCell,
    getLastCell,
    isValidCellPosition,
    clampCellPosition,
    calculateCellDistance,
    getCellRange,
    getCellElement,
    focusCellElement,

    // Grid utilities
    generateRowKey,
    normalizeGridData,
    calculateColumnWidth,
    calculateTotalGridWidth,
    getVisibleColumns,
    getVisibleRows,
    prepareVisibleRows,
    updateRowData,
    updateMultipleRows,
    addRow,
    removeRow,
    removeMultipleRows,
    getRowById,
    getRowIndexById,
    getColumnByKey,
    getColumnIndexByKey,
    sortRows,
    filterRows,
    paginateRows,
    getGridSummary,
    areAllRowsSelected,
    toggleSelectAllRows,
    getSelectedRowsData,
    exportGridDataToCSV,
} from './utils';
