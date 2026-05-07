/**
 * Grid focus management hook
 * Manages active cell and focus state for the grid
 */
import { useCallback, useMemo, useState } from 'react';
import type { GridCellPosition } from '@/shared/components/GridTable/types/grid.types';

interface UseGridFocusReturn {
    /** Current active cell position */
    activeCell: GridCellPosition | null;

    /** Set active cell position */
    setActiveCell: (position: GridCellPosition | null) => void;

    /** Clear focus */
    clearFocus: () => void;

    /** Focus cell at position */
    focusCell: (rowIndex: number, colIndex: number) => void;

    /** Check if cell is focused */
    isCellFocused: (rowIndex: number, colIndex: number) => boolean;

    /** Move focus up */
    focusPrevious: (rows: number, cols: number) => void;

    /** Move focus down */
    focusNext: (rows: number, cols: number) => void;
}

/**
 * Hook for managing grid cell focus state
 * Tracks which cell is currently active/focused
 */
export function useGridFocus(): UseGridFocusReturn {
    const [activeCell, setActiveCell] = useState<GridCellPosition | null>(null);

    const clearFocus = useCallback(() => {
        setActiveCell(null);
    }, []);

    const focusCell = useCallback((rowIndex: number, colIndex: number) => {
        setActiveCell({ rowIndex, colIndex });
    }, []);

    const isCellFocused = useCallback(
        (rowIndex: number, colIndex: number): boolean => {
            return (
                activeCell?.rowIndex === rowIndex && activeCell?.colIndex === colIndex
            );
        },
        [activeCell]
    );

    const focusPrevious = useCallback(
        (rows: number, cols: number) => {
            if (!activeCell) {
                setActiveCell({ rowIndex: 0, colIndex: 0 });
                return;
            }

            let { rowIndex, colIndex } = activeCell;

            // Move left
            colIndex -= 1;

            if (colIndex < 0) {
                // Wrap to previous row
                rowIndex -= 1;
                if (rowIndex < 0) {
                    rowIndex = rows - 1;
                }
                colIndex = cols - 1;
            }

            setActiveCell({ rowIndex, colIndex });
        },
        [activeCell]
    );

    const focusNext = useCallback(
        (rows: number, cols: number) => {
            if (!activeCell) {
                setActiveCell({ rowIndex: 0, colIndex: 0 });
                return;
            }

            let { rowIndex, colIndex } = activeCell;

            // Move right
            colIndex += 1;

            if (colIndex >= cols) {
                // Wrap to next row
                colIndex = 0;
                rowIndex += 1;
                if (rowIndex >= rows) {
                    rowIndex = 0;
                }
            }

            setActiveCell({ rowIndex, colIndex });
        },
        [activeCell]
    );

    return useMemo(
        () => ({
            activeCell,
            setActiveCell,
            clearFocus,
            focusCell,
            isCellFocused,
            focusPrevious,
            focusNext,
        }),
        [activeCell, clearFocus, focusCell, isCellFocused, focusPrevious, focusNext]
    );
}
