import type { GridColumn } from './column.types';
import type { NavigationDirection as NavigationDirectionType } from './navigation.types';

/**
 * Identifies a specific cell location in the grid by row and column index.
 */
export interface CellCoord {
    /**
     * Zero-based row index of the cell.
     */
    rowIndex: number;

    /**
     * Zero-based column index of the cell.
     */
    colIndex: number;
}

/**
 * Tracks interactive state for cell focus and editing.
 */
export interface CellState {
    /**
     * The currently active (focused) cell, or null when none is active.
     */
    active: CellCoord | null;

    /**
     * The cell currently in edit mode, or null when not editing.
     */
    editing: CellCoord | null;
}

/**
 * Supported primitive value types for a grid cell.
 */
export type CellValue = string | number | boolean | null | Date;

/**
 * Describes a committed change to a single cell.
 */
export interface CellChangeEvent {
    /**
     * Zero-based row index of the changed cell.
     */
    rowIndex: number;

    /**
     * Zero-based column index of the changed cell.
     */
    colIndex: number;

    /**
     * The column key whose value changed.
     */
    key: string;

    /**
     * Previous value before the edit was committed.
     */
    oldValue: CellValue;

    /**
     * New value after the edit was committed.
     */
    newValue: CellValue;
}

/**
 * Directional intent for keyboard/navigation actions between cells.
 *
 * This is re-exported from the shared navigation types to keep definitions consistent.
 */
export type NavigationDirection = NavigationDirectionType;

/**
 * Base props that every cell editor component receives from the GridTable.
 */
export interface EditorBaseProps {
    /**
     * Column definition describing how to render/edit the cell.
     */
    column: GridColumn;

    /**
     * Current value of the cell.
     */
    value: CellValue;

    /**
     * Zero-based row index of the cell being edited.
     */
    rowIndex: number;

    /**
     * Zero-based column index of the cell being edited.
     */
    colIndex: number;

    /**
     * Commit callback used by editors to persist a value change.
     */
    onCommit: (event: CellChangeEvent) => void;

    /**
     * Navigation callback for moving focus to an adjacent cell.
     */
    onNavigate: (direction: NavigationDirection) => void;
}
