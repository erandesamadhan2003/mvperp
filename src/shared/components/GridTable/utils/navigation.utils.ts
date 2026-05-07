/**
 * Navigation utility functions for spreadsheet/grid keyboard movement
 * DOM-safe navigation with boundary handling
 */
import type { GridCellPosition } from '@/shared/components/GridTable/types/grid.types';

/**
 * Finds next cell when moving right (Arrow Right key)
 */
export function getNextCell(
    currentCol: number,
    currentRow: number,
    totalCols: number,
    totalRows: number,
    options?: { wrapRow?: boolean }
): GridCellPosition | null {
    const { wrapRow = true } = options || {};

    const nextCol = currentCol + 1;

    if (nextCol < totalCols) {
        return { rowIndex: currentRow, colIndex: nextCol };
    }

    // Wrap to next row if wrapRow enabled
    if (wrapRow && currentRow + 1 < totalRows) {
        return { rowIndex: currentRow + 1, colIndex: 0 };
    }

    return null;
}

/**
 * Finds previous cell when moving left (Arrow Left key)
 */
export function getPreviousCell(
    currentCol: number,
    currentRow: number,
    totalCols: number,
    totalRows: number,
    options?: { wrapRow?: boolean }
): GridCellPosition | null {
    const { wrapRow = true } = options || {};

    const prevCol = currentCol - 1;

    if (prevCol >= 0) {
        return { rowIndex: currentRow, colIndex: prevCol };
    }

    // Wrap to previous row if wrapRow enabled
    if (wrapRow && currentRow - 1 >= 0) {
        return { rowIndex: currentRow - 1, colIndex: totalCols - 1 };
    }

    return null;
}

/**
 * Finds cell above when moving up (Arrow Up key)
 */
export function getCellAbove(
    currentCol: number,
    currentRow: number,
    totalCols: number,
    totalRows: number,
    options?: { wrapColumn?: boolean }
): GridCellPosition | null {
    const { wrapColumn = false } = options || {};

    const prevRow = currentRow - 1;

    if (prevRow >= 0) {
        return { rowIndex: prevRow, colIndex: currentCol };
    }

    // Wrap to bottom if wrapColumn enabled
    if (wrapColumn) {
        return { rowIndex: totalRows - 1, colIndex: currentCol };
    }

    return null;
}

/**
 * Finds cell below when moving down (Arrow Down key)
 */
export function getCellBelow(
    currentCol: number,
    currentRow: number,
    totalCols: number,
    totalRows: number,
    options?: { wrapColumn?: boolean }
): GridCellPosition | null {
    const { wrapColumn = false } = options || {};

    const nextRow = currentRow + 1;

    if (nextRow < totalRows) {
        return { rowIndex: nextRow, colIndex: currentCol };
    }

    // Wrap to top if wrapColumn enabled
    if (wrapColumn) {
        return { rowIndex: 0, colIndex: currentCol };
    }

    return null;
}

/**
 * Finds cell when pressing Tab (move right, wrap rows)
 */
export function getTabCell(
    currentCol: number,
    currentRow: number,
    totalCols: number,
    totalRows: number
): GridCellPosition | null {
    const nextCol = currentCol + 1;

    if (nextCol < totalCols) {
        return { rowIndex: currentRow, colIndex: nextCol };
    }

    // Move to next row
    if (currentRow + 1 < totalRows) {
        return { rowIndex: currentRow + 1, colIndex: 0 };
    }

    return null;
}

/**
 * Finds cell when pressing Shift+Tab (move left, wrap rows backwards)
 */
export function getShiftTabCell(
    currentCol: number,
    currentRow: number,
    totalCols: number,
    totalRows: number
): GridCellPosition | null {
    const prevCol = currentCol - 1;

    if (prevCol >= 0) {
        return { rowIndex: currentRow, colIndex: prevCol };
    }

    // Move to previous row, last column
    if (currentRow - 1 >= 0) {
        return { rowIndex: currentRow - 1, colIndex: totalCols - 1 };
    }

    return null;
}

/**
 * Moves to first cell in row
 */
export function getFirstCellInRow(
    currentRow: number,
    totalCols: number
): GridCellPosition {
    return { rowIndex: currentRow, colIndex: 0 };
}

/**
 * Moves to last cell in row
 */
export function getLastCellInRow(
    currentRow: number,
    totalCols: number
): GridCellPosition {
    return { rowIndex: currentRow, colIndex: Math.max(0, totalCols - 1) };
}

/**
 * Moves to first cell in column
 */
export function getFirstCellInColumn(
    currentCol: number
): GridCellPosition {
    return { rowIndex: 0, colIndex: currentCol };
}

/**
 * Moves to last cell in column
 */
export function getLastCellInColumn(
    currentCol: number,
    totalRows: number
): GridCellPosition {
    return { rowIndex: Math.max(0, totalRows - 1), colIndex: currentCol };
}

/**
 * Gets first cell in grid
 */
export function getFirstCell(): GridCellPosition {
    return { rowIndex: 0, colIndex: 0 };
}

/**
 * Gets last cell in grid
 */
export function getLastCell(
    totalCols: number,
    totalRows: number
): GridCellPosition {
    return {
        rowIndex: Math.max(0, totalRows - 1),
        colIndex: Math.max(0, totalCols - 1),
    };
}

/**
 * Checks if cell position is valid
 */
export function isValidCellPosition(
    position: GridCellPosition,
    totalCols: number,
    totalRows: number
): boolean {
    return (
        position.rowIndex >= 0 &&
        position.rowIndex < totalRows &&
        position.colIndex >= 0 &&
        position.colIndex < totalCols
    );
}

/**
 * Clamps cell position to valid grid bounds
 */
export function clampCellPosition(
    position: GridCellPosition,
    totalCols: number,
    totalRows: number
): GridCellPosition {
    return {
        rowIndex: Math.max(0, Math.min(position.rowIndex, totalRows - 1)),
        colIndex: Math.max(0, Math.min(position.colIndex, totalCols - 1)),
    };
}

/**
 * Calculates distance between two cells (useful for range selection)
 */
export function calculateCellDistance(
    from: GridCellPosition,
    to: GridCellPosition
): number {
    const rowDiff = Math.abs(to.rowIndex - from.rowIndex);
    const colDiff = Math.abs(to.colIndex - from.colIndex);
    return rowDiff + colDiff;
}

/**
 * Gets all cells between two positions (for range selection future support)
 */
export function getCellRange(
    from: GridCellPosition,
    to: GridCellPosition
): GridCellPosition[] {
    const cells: GridCellPosition[] = [];

    const minRow = Math.min(from.rowIndex, to.rowIndex);
    const maxRow = Math.max(from.rowIndex, to.rowIndex);
    const minCol = Math.min(from.colIndex, to.colIndex);
    const maxCol = Math.max(from.colIndex, to.colIndex);

    for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
            cells.push({ rowIndex: row, colIndex: col });
        }
    }

    return cells;
}

/**
 * Gets cell element reference by position (for focus management)
 */
export function getCellElement(
    gridId: string | undefined,
    rowIndex: number,
    colIndex: number
): HTMLElement | null {
    const cellId = `grid-cell-${rowIndex}-${colIndex}`;
    const query = gridId
        ? `#${gridId} [data-cell-id="${cellId}"]`
        : `[data-cell-id="${cellId}"]`;

    return document.querySelector(query) as HTMLElement | null;
}

/**
 * Focuses a cell element safely
 */
export function focusCellElement(
    gridId: string | undefined,
    rowIndex: number,
    colIndex: number
): boolean {
    const element = getCellElement(gridId, rowIndex, colIndex);
    if (element) {
        element.focus();
        return true;
    }
    return false;
}
