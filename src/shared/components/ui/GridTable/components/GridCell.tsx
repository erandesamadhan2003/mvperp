import * as React from "react";

import { useGridContext } from "../context/useGridContext";
import type { CellChangeEvent, CellCoord, CellValue } from "../types/cell.types";
import type { GridColumn } from "../types/column.types";
import type { NavigationDirection } from "../types/navigation.types";
import { formatCellValue } from "../utils/cellRenderer";
import { getNavigationDirection, isEditableKey, shouldPreventDefault } from "../utils/keyboardMap";

import { EditorFactory } from "./editors/EditorFactory";

/**
 * Props for a single grid cell.
 */
export interface GridCellProps {
    /**
     * Row index within the current page (0-based).
     */
    rowIndex: number;

    /**
     * Column index (0-based).
     */
    colIndex: number;

    /**
     * Column definition for the cell.
     */
    column: GridColumn;

    /**
     * Raw value for this cell.
     */
    value: CellValue;
}

interface GridCellViewProps extends GridCellProps {
    widthPx: number;
    isActive: boolean;
    isEditing: boolean;
    hasError: boolean;
    errorMsg: string | null;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
    onCommit: (event: CellChangeEvent) => void;
    onNavigate: (dir: NavigationDirection) => void;
}

/**
 * GridCell view.
 *
 * This is the heavy rendering part and is memoized to avoid unnecessary work.
 * It receives derived booleans (`isActive`, `isEditing`, `hasError`) and only
 * re-renders when those (or `value`) change.
 */
function GridCellView(props: GridCellViewProps) {
    const {
        rowIndex,
        colIndex,
        column,
        value,
        widthPx,
        isActive,
        isEditing,
        hasError,
        errorMsg,
        onClick,
        onKeyDown,
        onCommit,
        onNavigate
    } = props;

    const ref = React.useRef<HTMLDivElement | null>(null);

    /**
     * Auto-focus the cell when it becomes active so keyboard navigation works.
     */
    React.useEffect(() => {
        if (isActive) ref.current?.focus();
    }, [isActive]);

    const border = React.useMemo(() => {
        if (isActive && !hasError) return "2px solid #0078d4";
        if (isActive && hasError) return "2px solid #d32f2f";
        if (!isActive && hasError) return "1px solid #f44336";
        return "1px solid #e0e0e0";
    }, [hasError, isActive]);

    const displayValue = React.useMemo(() => formatCellValue(value, column), [column, value]);

    return (
        <div
            ref={ref}
            role="gridcell"
            aria-colindex={colIndex + 1}
            aria-selected={isActive}
            aria-readonly={Boolean(column.readOnly)}
            tabIndex={isActive ? 0 : -1}
            onClick={onClick}
            onKeyDown={onKeyDown}
            title={String(value ?? "")}
            style={{
                position: "relative",
                width: `${widthPx}px`,
                minWidth: `${widthPx}px`,
                border,
                padding: "4px 6px",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                outline: "none"
            }}
        >
            {isEditing ? (
                <EditorFactory
                    column={column}
                    value={value}
                    rowIndex={rowIndex}
                    colIndex={colIndex}
                    onNavigate={onNavigate}
                    onCommit={onCommit}
                />
            ) : (
                displayValue
            )}

            {hasError && errorMsg ? (
                <div
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        marginTop: 2,
                        background: "#d32f2f",
                        color: "#ffffff",
                        fontSize: 11,
                        padding: "4px 6px",
                        borderRadius: 4,
                        zIndex: 10,
                        maxWidth: 260,
                        whiteSpace: "normal"
                    }}
                >
                    {errorMsg}
                </div>
            ) : null}
        </div>
    );
}

/**
 * Memoized GridCell view comparator.
 *
 * Re-renders only if value, active/editing state, or error presence changes.
 */
const MemoGridCellView = React.memo(
    GridCellView,
    (prev, next) =>
        prev.value === next.value &&
        prev.isActive === next.isActive &&
        prev.isEditing === next.isEditing &&
        prev.hasError === next.hasError
);

/**
 * GridCell — the most performance-critical component in GridTable.
 *
 * Excel-like behavior:
 * - Click activates the cell; if editable, it immediately enters edit mode.
 * - When active (but not editing):
 *   - Tab/Shift+Tab/Arrows/Enter navigate between cells.
 *   - Printable keys/F2 enter edit mode.
 * - Escape exits edit mode without changing the active cell.
 */
export function GridCell(props: GridCellProps) {
    const { rowIndex, colIndex, column, value } = props;

    const { cellState, setActive, setEditing, commitChange, goTo, columnWidths, cellErrors } = useGridContext();

    const cellKey = React.useMemo(() => `${rowIndex}-${colIndex}`, [rowIndex, colIndex]);

    const isActive = React.useMemo(
        () => cellState.active?.rowIndex === rowIndex && cellState.active?.colIndex === colIndex,
        [cellState.active, rowIndex, colIndex]
    );

    const isEditing = React.useMemo(
        () => cellState.editing?.rowIndex === rowIndex && cellState.editing?.colIndex === colIndex,
        [cellState.editing, rowIndex, colIndex]
    );

    const errorMsg = React.useMemo(() => cellErrors.get(cellKey) ?? null, [cellErrors, cellKey]);
    const hasError = React.useMemo(() => Boolean(errorMsg), [errorMsg]);

    const widthPx = React.useMemo(() => columnWidths.get(column.key) ?? column.width ?? 120, [columnWidths, column.key, column.width]);

    const coord: CellCoord = React.useMemo(() => ({ rowIndex, colIndex }), [rowIndex, colIndex]);

    const handleClick = React.useCallback(() => {
        setActive(coord);
        if (!column.readOnly) setEditing(coord);
    }, [column.readOnly, coord, setActive, setEditing]);

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (!isActive || isEditing) return;

            const dir = getNavigationDirection(e);
            if (dir) {
                if (shouldPreventDefault(e)) e.preventDefault();
                goTo(dir);
                return;
            }

            if (!column.readOnly && isEditableKey(e)) {
                setEditing(coord);
            }
        },
        [column.readOnly, coord, goTo, isActive, isEditing, setEditing]
    );

    const handleCommit = React.useCallback(
        (event: CellChangeEvent) => {
            commitChange(event);
        },
        [commitChange]
    );

    return (
        <MemoGridCellView
            rowIndex={rowIndex}
            colIndex={colIndex}
            column={column}
            value={value}
            widthPx={widthPx}
            isActive={isActive}
            isEditing={isEditing}
            hasError={hasError}
            errorMsg={errorMsg}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onCommit={handleCommit}
            onNavigate={goTo}
        />
    );
}

