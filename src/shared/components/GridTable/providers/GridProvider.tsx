/**
 * Grid context provider
 * Manages grid-wide state and provides utilities to all grid components
 */

import React, { useCallback, useMemo, useState, useContext } from 'react';
import type {
    GridCellPosition,
    GridSelectionState,
    GridEditingState,
    GridContextValue,
    GridColumn,
    GridRowData,
    GridChangeEvent,
} from '@/shared/components/GridTable/types/grid.types';

// Create context
const GridContext = React.createContext<GridContextValue | undefined>(undefined);

interface GridProviderProps {
    children: React.ReactNode;
    columns: GridColumn[];
    data: GridRowData[];
    onChange?: (event: GridChangeEvent) => void;
    keyboardNavigationEnabled?: boolean;
    initialActiveCell?: GridCellPosition | null;
}

/**
 * Grid context provider
 * Wraps grid and provides state to all components
 */
export function GridProvider({
    children,
    columns,
    data,
    onChange,
    keyboardNavigationEnabled = true,
    initialActiveCell = null,
}: GridProviderProps) {
    // Selection state
    const [selection, setSelection] = useState<GridSelectionState>({
        activeCell: initialActiveCell,
        selectedCells: [],
        selectedRows: [],
        rangeStart: null,
        rangeEnd: null,
    });

    // Editing state
    const [editing, setEditing] = useState<GridEditingState>({
        editingCell: null,
        editingValue: null,
        isEditing: false,
    });

    // Set active cell
    const setActiveCell = useCallback((position: GridCellPosition | null) => {
        setSelection((prev) => ({
            ...prev,
            activeCell: position,
        }));
    }, []);

    // Update selection state
    const updateSelection = useCallback(
        (updates: Partial<GridSelectionState>) => {
            setSelection((prev) => ({
                ...prev,
                ...updates,
            }));
        },
        []
    );

    // Start editing
    const startEditing = useCallback(
        (position: GridCellPosition, value?: any) => {
            setEditing({
                editingCell: position,
                editingValue: value ?? null,
                isEditing: true,
            });
        },
        []
    );

    // Stop editing
    const stopEditing = useCallback(() => {
        setEditing({
            editingCell: null,
            editingValue: null,
            isEditing: false,
        });
    }, []);

    // Set editing value
    const setEditingValue = useCallback((value: any) => {
        setEditing((prev) => ({
            ...prev,
            editingValue: value,
        }));
    }, []);

    // Clear selection
    const clearSelection = useCallback(() => {
        setSelection({
            activeCell: null,
            selectedCells: [],
            selectedRows: [],
            rangeStart: null,
            rangeEnd: null,
        });
    }, []);

    // Memoize context value
    const contextValue: GridContextValue = useMemo(
        () => ({
            selection,
            editing,
            setActiveCell,
            updateSelection,
            startEditing,
            stopEditing,
            setEditingValue,
            clearSelection,
            columns,
            data,
            onChange,
            keyboardNavigationEnabled,
        }),
        [
            selection,
            editing,
            setActiveCell,
            updateSelection,
            startEditing,
            stopEditing,
            setEditingValue,
            clearSelection,
            columns,
            data,
            onChange,
            keyboardNavigationEnabled,
        ]
    );

    return (
        <GridContext.Provider value={contextValue}>{children}</GridContext.Provider>
    );
}

/**
 * Hook to use grid context
 * Must be used within GridProvider
 */
export function useGrid(): GridContextValue {
    const context = useContext(GridContext);

    if (!context) {
        throw new Error('useGrid must be used within GridProvider');
    }

    return context;
}

/**
 * Hook to get only selection state from grid context
 */
export function useGridSelection() {
    const { selection, setActiveCell, updateSelection, clearSelection } =
        useGrid();

    return {
        selection,
        setActiveCell,
        updateSelection,
        clearSelection,
    };
}

/**
 * Hook to get only editing state from grid context
 */
export function useGridEditing() {
    const { editing, startEditing, stopEditing, setEditingValue } = useGrid();

    return {
        editing,
        startEditing,
        stopEditing,
        setEditingValue,
    };
}

/**
 * Hook to get grid data and columns
 */
export function useGridData() {
    const { columns, data } = useGrid();

    return {
        columns,
        data,
    };
}
