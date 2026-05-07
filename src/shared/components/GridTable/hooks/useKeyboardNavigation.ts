/**
 * Keyboard navigation hook for grid
 * Handles Excel-like keyboard navigation for the grid component
 */
import { useCallback, useEffect, useRef } from 'react';
import type { GridCellPosition } from '@/shared/components/GridTable/types/grid.types';
import {
    getNextCell,
    getPreviousCell,
    getCellAbove,
    getCellBelow,
    getTabCell,
    getShiftTabCell,
    isValidCellPosition,
} from '@/shared/components/GridTable/utils/navigation.utils';

interface UseKeyboardNavigationOptions {
    /** Total rows in grid */
    rows: number;

    /** Total columns in grid */
    cols: number;

    /** Current active cell position */
    activeCell: GridCellPosition | null;

    /** Callback when cursor moves */
    onMove: (position: GridCellPosition | null) => void;

    /** Callback when Enter is pressed */
    onEnter?: (position: GridCellPosition | null) => void;

    /** Callback when Escape is pressed */
    onEscape?: () => void;

    /** Enabled or disabled */
    enabled?: boolean;

    /** Grid container ref for focus management */
    containerRef?: React.RefObject<HTMLDivElement>;

    /** Allow wrapping at grid boundaries */
    wrapArrows?: boolean;

    /** Grid ID for DOM queries */
    gridId?: string;
}

interface UseKeyboardNavigationReturn {
    /** Handle keyboard event */
    handleKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;

    /** Is keyboard navigation ready */
    isReady: boolean;
}

/**
 * Hook for managing keyboard navigation in grid
 * Supports arrow keys, tab, enter, and shift modifiers
 */
export function useKeyboardNavigation(
    options: UseKeyboardNavigationOptions
): UseKeyboardNavigationReturn {
    const {
        rows,
        cols,
        activeCell,
        onMove,
        onEnter,
        onEscape,
        enabled = true,
        containerRef,
        wrapArrows = false,
        gridId,
    } = options;

    const isReadyRef = useRef(false);

    useEffect(() => {
        isReadyRef.current = enabled && rows > 0 && cols > 0;
    }, [enabled, rows, cols]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLElement>) => {
            if (!isReadyRef.current || !activeCell) {
                return;
            }

            let nextPosition: GridCellPosition | null = null;
            let shouldPreventDefault = false;

            const { rowIndex, colIndex } = activeCell;

            switch (event.key) {
                // Arrow Up
                case 'ArrowUp':
                    nextPosition = getCellAbove(
                        colIndex,
                        rowIndex,
                        cols,
                        rows,
                        { wrapColumn: wrapArrows }
                    );
                    shouldPreventDefault = true;
                    break;

                // Arrow Down
                case 'ArrowDown':
                    nextPosition = getCellBelow(
                        colIndex,
                        rowIndex,
                        cols,
                        rows,
                        { wrapColumn: wrapArrows }
                    );
                    shouldPreventDefault = true;
                    break;

                // Arrow Left
                case 'ArrowLeft':
                    nextPosition = getPreviousCell(
                        colIndex,
                        rowIndex,
                        cols,
                        rows,
                        { wrapRow: wrapArrows }
                    );
                    shouldPreventDefault = true;
                    break;

                // Arrow Right
                case 'ArrowRight':
                    nextPosition = getNextCell(
                        colIndex,
                        rowIndex,
                        cols,
                        rows,
                        { wrapRow: wrapArrows }
                    );
                    shouldPreventDefault = true;
                    break;

                // Tab
                case 'Tab':
                    if (event.shiftKey) {
                        nextPosition = getShiftTabCell(colIndex, rowIndex, cols, rows);
                    } else {
                        nextPosition = getTabCell(colIndex, rowIndex, cols, rows);
                    }
                    shouldPreventDefault = true;
                    break;

                // Enter - start editing or confirm
                case 'Enter':
                    shouldPreventDefault = true;
                    if (onEnter) {
                        onEnter(activeCell);
                    }
                    break;

                // Escape - cancel editing
                case 'Escape':
                    shouldPreventDefault = true;
                    if (onEscape) {
                        onEscape();
                    }
                    break;

                // Home - go to first column
                case 'Home':
                    if (!event.ctrlKey && !event.metaKey) {
                        nextPosition = { rowIndex, colIndex: 0 };
                        shouldPreventDefault = true;
                    }
                    break;

                // End - go to last column
                case 'End':
                    if (!event.ctrlKey && !event.metaKey) {
                        nextPosition = { rowIndex, colIndex: cols - 1 };
                        shouldPreventDefault = true;
                    }
                    break;

                // Ctrl+Home - go to first cell
                case 'Home':
                    if (event.ctrlKey || event.metaKey) {
                        nextPosition = { rowIndex: 0, colIndex: 0 };
                        shouldPreventDefault = true;
                    }
                    break;

                // Ctrl+End - go to last cell
                case 'End':
                    if (event.ctrlKey || event.metaKey) {
                        nextPosition = { rowIndex: rows - 1, colIndex: cols - 1 };
                        shouldPreventDefault = true;
                    }
                    break;

                default:
                    break;
            }

            // Validate next position
            if (
                nextPosition &&
                isValidCellPosition(nextPosition, cols, rows)
            ) {
                onMove(nextPosition);
                shouldPreventDefault = true;
            }

            if (shouldPreventDefault) {
                event.preventDefault();
            }
        },
        [activeCell, rows, cols, onMove, onEnter, onEscape, wrapArrows]
    );

    return {
        handleKeyDown,
        isReady: isReadyRef.current,
    };
}
