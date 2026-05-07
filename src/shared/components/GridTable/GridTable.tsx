import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import type {
    GridTableProps,
    GridCellPosition,
    GridRowData,
    GridChangeEvent,
    GridColumn,
} from '@/shared/components/GridTable/types/grid.types';
import { GridProvider, useGrid } from '@/shared/components/GridTable/providers/GridProvider';
import { GridHeader } from './GridHeader';
import { GridRow } from './GridRow';
import { useGridFocus } from '@/shared/components/GridTable/hooks/useGridFocus';
import { useKeyboardNavigation } from '@/shared/components/GridTable/hooks/useKeyboardNavigation';
import { useVirtualRow } from '@/shared/components/GridTable/hooks/useVirtualRowa';
import {
    normalizeGridData,
    getVisibleRows,
    updateRowData,
} from '@/shared/components/GridTable/utils/grid.utils';
import {
    getCellValue,
    createChangeEvent,
    isCellValueChanged,
} from '@/shared/components/GridTable/utils/cell.utils';
import { focusCellElement } from '@/shared/components/GridTable/utils/navigation.utils';
import './GridTable.css';

/**
 * Internal GridTable component (used within GridProvider)
 */
function GridTableInternal<T extends Record<string, any> = Record<string, any>>(
    props: GridTableProps<T>
) {
    const {
        columns,
        data: rawData,
        onChange,
        rowHeight = 32,
        headerHeight = 40,
        loading = false,
        editable = true,
        className,
        wrapperClassName,
        id,
        onActiveCellChange,
        keyboardNavigation = true,
        minWidth,
        bordered = true,
        striped = false,
        hoverable = true,
        compact = false,
        rowClassName,
        cellClassName,
        emptyMessage = 'No data available',
    } = props;

    // Normalize data
    const normalizedData = useMemo<GridRowData<T>[]>(
        () => normalizeGridData(rawData, props.getRowKey),
        [rawData, props.getRowKey]
    );

    // Grid context
    const { selection, editing, setActiveCell, startEditing, stopEditing, setEditingValue } = useGrid();

    // Focus management
    const { activeCell, setActiveCell: setFocusCell, focusCell } = useGridFocus();
    const containerRef = useRef<HTMLDivElement>(null);
    const tableRef = useRef<HTMLDivElement>(null);

    // Update context active cell when focus changes
    useEffect(() => {
        setActiveCell(activeCell);
        onActiveCellChange?.(activeCell);
    }, [activeCell, setActiveCell, onActiveCellChange]);

    // Keyboard navigation
    const { handleKeyDown: handleGridKeyDown } = useKeyboardNavigation({
        rows: normalizedData.length,
        cols: columns.length,
        activeCell,
        onMove: (position) => {
            if (position) {
                focusCell(position.rowIndex, position.colIndex);
                // Focus the cell element after a microtask to ensure DOM is ready
                setTimeout(() => {
                    focusCellElement(id, position.rowIndex, position.colIndex);
                }, 0);
            }
        },
        onEnter: (position) => {
            if (position && editable) {
                const rowData = normalizedData[position.rowIndex];
                const column = columns[position.colIndex];
                const cellValue = rowData?.data?.[column.key];
                startEditing(position, cellValue);
            }
        },
        onEscape: () => {
            stopEditing();
        },
        enabled: keyboardNavigation,
        containerRef: containerRef as React.RefObject<HTMLDivElement>,
        gridId: id,
    });

    // Virtualization (simplified - future enhancement)
    const visibleRows = useMemo(
        () => getVisibleRows(normalizedData),
        [normalizedData]
    );

    // Hover state
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);

    // Handle cell change
    const handleCellChange = useCallback(
        (rowIndex: number, colIndex: number, newValue: any) => {
            const column = columns[colIndex];
            const rowData = normalizedData[rowIndex];

            if (!rowData || !column) return;

            const previousValue = getCellValue(rowData, column.key);

            // Check if value actually changed
            if (!isCellValueChanged(previousValue, newValue)) {
                return;
            }

            // Update row data
            const updatedRowData = {
                ...rowData,
                data: { ...rowData.data, [column.key]: newValue },
            };

            // Create change event
            const changeEvent = createChangeEvent(
                { rowIndex, colIndex },
                rowData.id,
                column.key,
                previousValue,
                newValue,
                updatedRowData,
                rowIndex
            );

            // Notify parent
            onChange?.(changeEvent);
        },
        [columns, normalizedData, onChange]
    );

    // Handle cell focus
    const handleCellFocus = useCallback(
        (rowIndex: number, colIndex: number) => {
            focusCell(rowIndex, colIndex);
        },
        [focusCell]
    );

    // Handle edit start
    const handleEditStart = useCallback(
        (rowIndex: number, colIndex: number, value: any) => {
            startEditing({ rowIndex, colIndex }, value);
        },
        [startEditing]
    );

    // Handle edit stop
    const handleEditStop = useCallback(
        (rowIndex: number, colIndex: number, value: any, cancelled: boolean = false) => {
            if (!cancelled) {
                handleCellChange(rowIndex, colIndex, value);
            }
            stopEditing();
        },
        [handleCellChange, stopEditing]
    );

    // Calculate total width
    const totalWidth = useMemo(() => {
        return columns.reduce((sum, col) => sum + (col.width || 100), 0);
    }, [columns]);

    const effectiveMinWidth = minWidth || totalWidth;

    // Main container class
    const containerClassName = clsx(
        'grid-table-root erp-surface rounded-lg overflow-hidden',
        compact && 'compact',
        className
    );

    // Content wrapper class
    const wrapperClassNameComputed = clsx(
        'grid-table-wrapper relative flex flex-col h-full bg-white',
        wrapperClassName
    );

    // Grid inner class
    const gridInnerClassName = clsx(
        'grid-table-inner overflow-x-auto overflow-y-auto flex-1',
        bordered && 'border border-slate-200'
    );

    // Rows container class
    const rowsContainerClassName = clsx(
        'grid-table-rows flex flex-col',
        striped && 'striped'
    );

    return (
        <div
            ref={containerRef}
            id={id}
            className={containerClassName}
            role="grid"
            aria-label="Data grid"
            suppressHydrationWarning
        >
            <div className={wrapperClassNameComputed}>
                {/* Header */}
                <GridHeader
                    columns={columns}
                    headerHeight={headerHeight}
                    minWidth={effectiveMinWidth}
                    bordered={bordered}
                    gridId={id}
                />

                {/* Data grid */}
                <div
                    ref={tableRef}
                    className={gridInnerClassName}
                    onKeyDown={handleGridKeyDown}
                    suppressHydrationWarning
                >
                    {loading ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="text-slate-600">Loading...</div>
                        </div>
                    ) : normalizedData.length === 0 ? (
                        <div className="flex items-center justify-center p-8 text-slate-500">
                            {emptyMessage}
                        </div>
                    ) : (
                        <div className={rowsContainerClassName} style={{ minWidth: `${effectiveMinWidth}px` }}>
                            {visibleRows.map((rowData, displayIndex) => {
                                const actualIndex = normalizedData.findIndex((r) => r.id === rowData.id);

                                return (
                                    <GridRow
                                        key={`${rowData.id}-${actualIndex}`}
                                        rowData={rowData}
                                        rowIndex={actualIndex}
                                        columns={columns}
                                        rowHeight={rowHeight}
                                        activeCell={activeCell}
                                        editingCell={editing.editingCell}
                                        gridEditable={editable}
                                        isHovered={hoverable && hoveredRow === actualIndex}
                                        onCellChange={(colIndex, value) =>
                                            handleCellChange(actualIndex, colIndex, value)
                                        }
                                        onCellFocus={(colIndex) =>
                                            handleCellFocus(actualIndex, colIndex)
                                        }
                                        onEditStart={(colIndex, value) =>
                                            handleEditStart(actualIndex, colIndex, value)
                                        }
                                        onEditStop={(colIndex, value, cancelled) =>
                                            handleEditStop(actualIndex, colIndex, value, cancelled)
                                        }
                                        onKeyDown={handleGridKeyDown}
                                        minWidth={effectiveMinWidth}
                                        bordered={bordered}
                                        gridId={id}
                                        rowClassName={rowClassName as (rowData: GridRowData, rowIndex: number) => string}
                                        cellClassName={((value: any, rd: GridRowData, ri: number, colIndex: number) => cellClassName?.(value, rd as any, ri, colIndex) ?? '') as any}
                                        onMouseEnter={() => hoverable && setHoveredRow(actualIndex)}
                                        onMouseLeave={() => hoverable && setHoveredRow(null)}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * GridTable component wrapper with provider
 */
export function GridTable<T extends Record<string, any> = Record<string, any>>(
    props: GridTableProps<T>
) {
    return (
        <GridProvider
            columns={props.columns}
            data={props.data}
            onChange={props.onChange}
            keyboardNavigationEnabled={props.keyboardNavigation !== false}
        >
            <GridTableInternal {...props} />
        </GridProvider>
    );
}

GridTable.displayName = 'GridTable';
