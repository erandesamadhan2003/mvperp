/**
 * Grid row component
 * Renders a single row with dynamic columns and cells
 */
import React, { useMemo, useCallback } from 'react';
import clsx from 'clsx';
import type { GridColumn, GridRowData, GridCellPosition } from '@/shared/components/GridTable/types/grid.types';
import { GridCell } from './GridCell';
import { getVisibleColumns, calculateColumnWidth } from '@/shared/components/GridTable/utils/grid.utils';

interface GridRowProps {
    /** Row data */
    rowData: GridRowData;

    /** Row index */
    rowIndex: number;

    /** Column definitions */
    columns: GridColumn[];

    /** Row height */
    rowHeight?: number;

    /** Active cell position */
    activeCell?: GridCellPosition | null;

    /** Editing cell position */
    editingCell?: GridCellPosition | null;

    /** Selected cells */
    selectedCells?: GridCellPosition[];

    /** Whether row is selected */
    isSelected?: boolean;

    /** Whether row is hovered */
    isHovered?: boolean;

    /** Grid allows editing */
    gridEditable?: boolean;

    /** Callback on cell value change */
    onCellChange?: (colIndex: number, value: any) => void;

    /** Callback on cell focus */
    onCellFocus?: (colIndex: number) => void;

    /** Callback on edit start */
    onEditStart?: (colIndex: number, value: any) => void;

    /** Callback on edit stop */
    onEditStop?: (colIndex: number, value: any, cancelled?: boolean) => void;

    /** Callback on keyboard event */
    onKeyDown?: (event: React.KeyboardEvent<HTMLElement>, colIndex: number) => void;

    /** Min width for horizontal scroll */
    minWidth?: number;

    /** Custom row class */
    className?: string;

    /** Grid ID */
    gridId?: string;

    /** Show borders */
    bordered?: boolean;

    /** Row class callback */
    rowClassName?: (rowData: GridRowData, rowIndex: number) => string;

    /** Cell class callback */
    cellClassName?: (value: any, rowData: GridRowData, rowIndex: number, colIndex: number) => string;

    /** Mouse enter handler */
    onMouseEnter?: () => void;

    /** Mouse leave handler */
    onMouseLeave?: () => void;
}

/**
 * GridRow component
 * Renders row with cells and handles cell interactions
 */
export const GridRow = React.forwardRef<HTMLDivElement, GridRowProps>(
    (
        {
            rowData,
            rowIndex,
            columns,
            rowHeight = 32,
            activeCell,
            editingCell,
            selectedCells = [],
            isSelected = false,
            isHovered = false,
            gridEditable = true,
            onCellChange,
            onCellFocus,
            onEditStart,
            onEditStop,
            onKeyDown,
            minWidth,
            className,
            gridId,
            bordered = true,
            rowClassName,
            cellClassName,
            onMouseEnter,
            onMouseLeave,
        },
        ref
    ) => {
        const visibleColumns = useMemo(
            () => getVisibleColumns(columns),
            [columns]
        );

        const totalWidth = useMemo(() => {
            let width = 0;
            visibleColumns.forEach((col) => {
                width += calculateColumnWidth(col) || 100;
            });
            return width;
        }, [visibleColumns]);

        const effectiveMinWidth = minWidth || totalWidth;

        const rowElement = useMemo(() => {
            const selectedCellSet = new Set(
                selectedCells.map((c) => `${c.rowIndex}-${c.colIndex}`)
            );

            return (
                <>
                    {visibleColumns.map((column, colIndex) => {
                        const cellValue = rowData.data?.[column.key];
                        const cellPosition: GridCellPosition = { rowIndex, colIndex };
                        const isCellActive = activeCell?.rowIndex === rowIndex && activeCell?.colIndex === colIndex;
                        const isCellEditing = editingCell?.rowIndex === rowIndex && editingCell?.colIndex === colIndex;
                        const isCellSelected = selectedCellSet.has(`${rowIndex}-${colIndex}`);

                        const cellClass = cellClassName?.(cellValue, rowData, rowIndex, colIndex);

                        return (
                            <GridCell
                                key={`${rowData.id}-cell-${column.key}-${colIndex}`}
                                value={cellValue}
                                column={column}
                                rowIndex={rowIndex}
                                colIndex={colIndex}
                                isFocused={isCellActive}
                                isEditing={isCellEditing}
                                isSelected={isCellSelected}
                                isHovered={isHovered && isCellActive}
                                height={rowHeight}
                                gridEditable={gridEditable}
                                onChange={(newValue) => onCellChange?.(colIndex, newValue)}
                                onFocus={() => onCellFocus?.(colIndex)}
                                onEditStart={(r, c, val) => onEditStart?.(colIndex, val)}
                                onEditStop={(r, c, val, cancelled) => onEditStop?.(colIndex, val, cancelled)}
                                onKeyDown={(e, r, c) => onKeyDown?.(e, colIndex)}
                                className={cellClass}
                                gridId={gridId}
                                rowData={rowData.data}
                            />
                        );
                    })}
                </>
            );
        }, [visibleColumns, rowData, rowIndex, activeCell, editingCell, selectedCells, isHovered, gridEditable, onCellChange, onCellFocus, onEditStart, onEditStop, onKeyDown, gridId, rowHeight, cellClassName]);

        const rowClassNames = clsx(
            'flex border-b border-slate-200',
            bordered && 'border-l border-r border-slate-200',
            rowData.disabled && 'opacity-50 pointer-events-none',
            isHovered && 'bg-slate-50',
            isSelected && 'bg-blue-50',
            className,
            rowClassName?.(rowData, rowIndex)
        );

        return (
            <div
                ref={ref}
                data-row-index={rowIndex}
                data-row-id={rowData.id}
                className={rowClassNames}
                style={{
                    minWidth: `${effectiveMinWidth}px`,
                    height: `${rowHeight}px`,
                }}
                role="row"
                aria-selected={isSelected}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                suppressHydrationWarning
            >
                {rowElement}
            </div>
        );
    }
);

GridRow.displayName = 'GridRow';
