/**
 * Grid header component
 * Renders column headers with styling and future support for sorting/filtering
 */
import React, { useMemo } from 'react';
import type { GridColumn } from '@/shared/components/GridTable/types/grid.types';
import { getVisibleColumns, calculateColumnWidth } from '@/shared/components/GridTable/utils/grid.utils';
import clsx from 'clsx';

interface GridHeaderProps {
    /** Column definitions */
    columns: GridColumn[];

    /** Height of header row */
    headerHeight?: number;

    /** Min width for horizontal scroll */
    minWidth?: number;

    /** Whether to show borders */
    bordered?: boolean;

    /** Custom class name */
    className?: string;

    /** Grid ID for styling */
    gridId?: string;

    /** On column click (future sorting) */
    onColumnClick?: (column: GridColumn, index: number) => void;

    /** Column being sorted (future) */
    sortColumn?: string;

    /** Sort direction (future) */
    sortDirection?: 'asc' | 'desc';
}

/**
 * GridHeader component
 * Renders sticky header with columns
 */
export const GridHeader = React.forwardRef<HTMLDivElement, GridHeaderProps>(
    (
        {
            columns,
            headerHeight = 40,
            minWidth,
            bordered = true,
            className,
            gridId,
            onColumnClick,
            sortColumn,
            sortDirection,
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

        const headerClassName = clsx(
            'sticky top-0 z-10 flex bg-slate-100 border-b border-slate-200',
            bordered && 'border-l border-r border-slate-200',
            className
        );

        return (
            <div
                ref={ref}
                id={gridId ? `${gridId}-header` : undefined}
                className={headerClassName}
                style={{
                    minWidth: `${effectiveMinWidth}px`,
                    height: `${headerHeight}px`,
                }}
                role="row"
                aria-label="Grid header"
            >
                {visibleColumns.map((column, colIndex) => {
                    const columnWidth = calculateColumnWidth(column) || 100;
                    const isSorted = sortColumn === column.key;

                    const cellClassName = clsx(
                        'flex-shrink-0 flex items-center px-3 py-2 font-semibold text-sm text-slate-800 border-r border-slate-200',
                        'select-none',
                        'transition-colors hover:bg-slate-50',
                        column.sortable && 'cursor-pointer',
                        isSorted && 'bg-slate-50',
                        column.align === 'center' && 'justify-center',
                        column.align === 'right' && 'justify-end'
                    );

                    const handleColumnClick = () => {
                        if (column.sortable || onColumnClick) {
                            onColumnClick?.(column, colIndex);
                        }
                    };

                    return (
                        <div
                            key={`${column.key}-header-${colIndex}`}
                            className={cellClassName}
                            style={{
                                width: `${columnWidth}px`,
                                minWidth: `${columnWidth}px`,
                                maxWidth: `${columnWidth}px`,
                            }}
                            role="columnheader"
                            data-column-key={column.key}
                            onClick={handleColumnClick}
                            tabIndex={column.sortable ? 0 : -1}
                            onKeyDown={(e) => {
                                if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                                    handleColumnClick();
                                }
                            }}
                        >
                            <div className="flex items-center gap-2 w-full truncate">
                                {column.renderHeader ? (
                                    column.renderHeader(column)
                                ) : (
                                    <span className="truncate">{column.title}</span>
                                )}

                                {/* Sort indicator (future use) */}
                                {isSorted && sortDirection && (
                                    <span className="flex-shrink-0 ml-1 text-xs">
                                        {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
);

GridHeader.displayName = 'GridHeader';
