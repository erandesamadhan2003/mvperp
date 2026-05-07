/**
 * Grid cell component
 * Renders individual cells with editing support and focus management
 * Similar to Excel cells with keyboard navigation and edit mode
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import type { GridColumn, CellFocusType } from '@/shared/components/GridTable/types/grid.types';
import { formatCellValue, getCellDisplayValue, isCellEditable } from '@/shared/components/GridTable/utils/cell.utils';

interface GridCellProps {
    /** Cell value */
    value: any;

    /** Column definition */
    column: GridColumn;

    /** Row index */
    rowIndex: number;

    /** Column index */
    colIndex: number;

    /** Cell is focused/active */
    isFocused?: boolean;

    /** Cell is being edited */
    isEditing?: boolean;

    /** Cell is selected */
    isSelected?: boolean;

    /** Cell is in hover state */
    isHovered?: boolean;

    /** Cell height in pixels */
    height?: number;

    /** Whether grid allows editing */
    gridEditable?: boolean;

    /** Callback when value changes */
    onChange?: (value: any) => void;

    /** Callback when cell is focused */
    onFocus?: (rowIndex: number, colIndex: number) => void;

    /** Callback when cell editing starts */
    onEditStart?: (rowIndex: number, colIndex: number, value: any) => void;

    /** Callback when cell editing stops */
    onEditStop?: (rowIndex: number, colIndex: number, value: any, cancelled?: boolean) => void;

    /** Callback for keyboard events */
    onKeyDown?: (event: React.KeyboardEvent<HTMLElement>, rowIndex: number, colIndex: number) => void;

    /** Custom class for cell */
    className?: string;

    /** Grid ID for reference */
    gridId?: string;

    /** Row data (full row context) */
    rowData?: Record<string, any>;
}

/**
 * GridCell component
 * Renders editable cell with focus and keyboard navigation support
 */
export const GridCell = React.forwardRef<HTMLDivElement, GridCellProps>(
    (
        {
            value,
            column,
            rowIndex,
            colIndex,
            isFocused = false,
            isEditing = false,
            isSelected = false,
            isHovered = false,
            height = 32,
            gridEditable = true,
            onChange,
            onFocus,
            onEditStart,
            onEditStop,
            onKeyDown,
            className,
            gridId,
            rowData,
        },
        ref
    ) => {
        const inputRef = useRef<HTMLInputElement>(null);
        const [displayValue, setDisplayValue] = useState(value);

        // Update display value when value prop changes and not editing
        useEffect(() => {
            if (!isEditing) {
                setDisplayValue(value);
            }
        }, [value, isEditing]);

        // Auto-focus input when editing starts
        useEffect(() => {
            if (isEditing && inputRef.current) {
                inputRef.current.focus();
                inputRef.current.select();
            }
        }, [isEditing]);

        const cellEditable = useMemo(
            () => isCellEditable(column, rowData ? { id: rowIndex, data: rowData } : undefined, gridEditable),
            [column, rowData, rowIndex, gridEditable]
        );

        const displayContent = useMemo(
            () => getCellDisplayValue(value, column, { id: rowIndex, data: rowData || {} }, rowIndex),
            [value, column, rowIndex, rowData]
        );

        const handleFocus = useCallback(() => {
            onFocus?.(rowIndex, colIndex);
        }, [rowIndex, colIndex, onFocus]);

        const handleChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const newValue = e.target.value;
                setDisplayValue(newValue);
                onChange?.(newValue);
            },
            [onChange]
        );

        const handleDoubleClick = useCallback(() => {
            if (cellEditable) {
                onEditStart?.(rowIndex, colIndex, value);
            }
        }, [rowIndex, colIndex, cellEditable, value, onEditStart]);

        const handleKeyDown = useCallback(
            (e: React.KeyboardEvent<HTMLDivElement | HTMLInputElement>) => {
                // Bubble to grid's keyboard handler
                onKeyDown?.(e as React.KeyboardEvent<HTMLElement>, rowIndex, colIndex);

                // Handle Enter in edit mode
                if (isEditing && e.key === 'Enter') {
                    onEditStop?.(rowIndex, colIndex, displayValue, false);
                }

                // Handle Escape in edit mode
                if (isEditing && e.key === 'Escape') {
                    onEditStop?.(rowIndex, colIndex, value, true);
                }
            },
            [rowIndex, colIndex, isEditing, displayValue, value, onKeyDown, onEditStop]
        );

        const cellId = `grid-cell-${rowIndex}-${colIndex}`;
        const focusType: CellFocusType = isEditing ? 'editing' : isFocused ? 'active' : isSelected ? 'selected' : 'none';

        const cellClassNames = clsx(
            'flex-shrink-0 relative border-r border-slate-200 transition-colors',
            'focus:outline-none',
            // Focus styles
            isFocused && 'ring-2 ring-blue-500 ring-inset',
            isEditing && 'ring-2 ring-blue-600 ring-inset bg-white',
            isSelected && 'bg-blue-50',
            isHovered && !isFocused && 'bg-slate-50',
            // Editable cell indication
            cellEditable && isFocused && 'cursor-text',
            column.align === 'center' && 'justify-center',
            column.align === 'right' && 'justify-end',
            className
        );

        const contentClassNames = clsx(
            'w-full h-full px-3 py-2 text-sm text-slate-700',
            'flex items-center truncate',
            'pointer-events-none',
            gridEditable && cellEditable && 'cursor-cell'
        );

        return (
            <div
                ref={ref}
                id={cellId}
                data-cell-id={cellId}
                data-row-index={rowIndex}
                data-col-index={colIndex}
                data-column-key={column.key}
                className={cellClassNames}
                style={{
                    width: column.width || '100px',
                    minWidth: column.minWidth || '50px',
                    maxWidth: column.maxWidth || '500px',
                    height: `${height}px`,
                }}
                role="gridcell"
                tabIndex={isFocused ? 0 : -1}
                onFocus={handleFocus}
                onDoubleClick={handleDoubleClick}
                onKeyDown={handleKeyDown}
                aria-label={`${column.title} (row ${rowIndex + 1})`}
                aria-selected={isSelected || isFocused}
                aria-readonly={!cellEditable}
                suppressHydrationWarning
            >
                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={displayValue}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        className="w-full h-full px-3 py-2 text-sm border-0 focus:outline-none focus:ring-0 bg-transparent text-slate-700"
                        placeholder="Enter value..."
                        aria-label={`Edit ${column.title}`}
                    />
                ) : (
                    <div className={contentClassNames} onDoubleClick={handleDoubleClick}>
                        {displayContent}
                    </div>
                )}
            </div>
        );
    }
);

GridCell.displayName = 'GridCell';
