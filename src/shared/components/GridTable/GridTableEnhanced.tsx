/**
 * Enhanced GridTable component with TanStack React Table & React Virtual
 * Features: Virtualization, Pagination (10 rows/page), Keyboard navigation, Editing support
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  createColumnHelper,
  type ColumnDef,
  type Row,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { GridTableProps, GridRowData, GridChangeEvent, GridColumn, GridCellPosition } from '@/shared/components/GridTable/types/grid.types';
import { normalizeGridData } from '@/shared/components/GridTable/utils/grid.utils';
import { getCellValue, isCellValueChanged, createChangeEvent, formatCellValue, getCellDisplayValue, isCellEditable } from '@/shared/components/GridTable/utils/cell.utils';
import './GridTable.css';

const ROWS_PER_PAGE = 16;
interface EnhancedGridTableProps<T extends Record<string, any>> extends Omit<GridTableProps<T>, 'columns' | 'data'> {
  columns: GridColumn<T>[];
  data: T[];
  onRowClick?: (row: T, rowIndex: number) => void;
  onPageChange?: (page: number) => void;
}

/**
 * Enhanced GridTable using TanStack React Table + React Virtual
 */
export function GridTableEnhanced<T extends Record<string, any> = Record<string, any>>(
  props: EnhancedGridTableProps<T>
) {
  const {
    columns: gridColumns,
    data: rawData,
    onChange,
    rowHeight = 32,
    headerHeight = 40,
    loading = false,
    editable = true,
    className,
    wrapperClassName,
    id = 'grid-table-enhanced',
    keyboardNavigation = true,
    minWidth: minWidthProp,
    bordered = true,
    striped = false,
    hoverable = true,
    compact = false,
    rowClassName,
    cellClassName,
    emptyMessage = 'No data available',
    onRowClick,
    onPageChange,
  } = props;

  // State
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: ROWS_PER_PAGE });
  const [editingCell, setEditingCell] = useState<GridCellPosition | null>(null);
  const [editingValue, setEditingValue] = useState<any>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [activeCell, setActiveCell] = useState<GridCellPosition | null>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const virtualParentRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const justEnteredEditRef = useRef(false);

  // Normalize data
  const normalizedData = useMemo<GridRowData<T>[]>(
    () => normalizeGridData(rawData, props.getRowKey),
    [rawData, props.getRowKey]
  );

  // Convert GridColumn to TanStack ColumnDef
  const columnDefs = useMemo<ColumnDef<GridRowData<T>>[]>(
    () =>
      gridColumns.map((col) => ({
        accessorKey: col.key,
        header: col.title,
        cell: () => '', // Handled by custom rendering
        size: col.width || 100,
        enableColumnFilter: col.sortable,
      })),
    [gridColumns]
  );

  // Create table instance with TanStack React Table
  const table = useReactTable({
    data: normalizedData,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter,
      pagination,
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
  });

  // Set page size
  useEffect(() => {
    table.setPageSize(ROWS_PER_PAGE);
  }, [table]);

  // Notify on page change
  useEffect(() => {
    onPageChange?.(pagination.pageIndex);
  }, [pagination.pageIndex, onPageChange]);

  // Get paginated rows
  const paginatedRows = table.getRowModel().rows;

  // Ensure we have an active cell for keyboard navigation and focus the active cell DOM
  useEffect(() => {
    if (!activeCell && paginatedRows.length > 0) {
      setActiveCell({ rowIndex: 0, colIndex: 0 });
      return;
    }

    if (activeCell) {
      // try to find the cell element in rendered virtual rows and focus it
      const selector = `[data-grid-row="${activeCell.rowIndex}"][data-grid-col="${activeCell.colIndex}"]`;
      const el = virtualParentRef.current?.querySelector(selector) as HTMLElement | null;
      if (el) {
        el.focus();
      }
    }
  }, [activeCell, paginatedRows]);

  // Auto-enter edit mode when activeCell changes (if editable and not already editing)
  // DISABLED: This was causing keyboard navigation to break. We now enter edit mode on first keystroke only.
  // useEffect(() => {
  //   if (!activeCell) return;
  //   if (!editable) return;

  //   // Don't re-enter if we're already editing this same cell
  //   if (
  //     editingCell &&
  //     editingCell.rowIndex === activeCell.rowIndex &&
  //     editingCell.colIndex === activeCell.colIndex
  //   ) {
  //     return;
  //   }

  //   const row = paginatedRows[activeCell.rowIndex];
  //   const col = gridColumns[activeCell.colIndex];
  //   if (!row || !col) return;

  //   if (!isCellEditable(col)) return;

  //   const cellValue = getCellValue(row.original, col.key);
  //   setEditingCell(activeCell);
  //   setEditingValue(cellValue);

  //   // Mark that we just entered edit mode to prevent immediate blur handling
  //   justEnteredEditRef.current = true;
  //   // Clear the flag after a frame
  //   const timer = setTimeout(() => {
  //     justEnteredEditRef.current = false;
  //   }, 0);
  //   return () => clearTimeout(timer);
  // }, [activeCell]); // Only depend on activeCell to avoid circular updates

  // Virtualize rows
  const rowVirtualizer = useVirtualizer({
    count: paginatedRows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  // Calculate dimensions
  const totalWidth = useMemo(
    () => gridColumns.reduce((sum, col) => sum + (col.width || 100), 0),
    [gridColumns]
  );
  const effectiveMinWidth = minWidthProp || totalWidth;
  // Pre-calc sticky left offsets for first two columns
  const leftOffsets = useMemo(() => {
    const offsets: number[] = [];
    let acc = 0;
    for (let i = 0; i < gridColumns.length; i++) {
      offsets[i] = acc;
      acc += gridColumns[i].width || 100;
    }
    return offsets;
  }, [gridColumns]);

  // Handle cell change
  const handleCellChange = useCallback(
    (rowIndex: number, colIndex: number, newValue: any) => {
      const row = paginatedRows[rowIndex];
      if (!row) return;

      const rowData = row.original;
      const column = gridColumns[colIndex];

      if (!column) return;

      const previousValue = getCellValue(rowData, column.key);

      if (!isCellValueChanged(previousValue, newValue)) {
        return;
      }

      const updatedRowData = {
        ...rowData,
        data: { ...rowData.data, [column.key]: newValue },
      };

      const changeEvent = createChangeEvent(
        { rowIndex, colIndex },
        rowData.id,
        column.key,
        previousValue,
        newValue,
        updatedRowData,
        rowIndex
      );

      onChange?.(changeEvent);
    },
    [gridColumns, paginatedRows, onChange]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>, rowIndex: number, colIndex: number) => {
      if (!keyboardNavigation) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (rowIndex > 0) {
            setActiveCell({ rowIndex: rowIndex - 1, colIndex });
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (rowIndex < paginatedRows.length - 1) {
            setActiveCell({ rowIndex: rowIndex + 1, colIndex });
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (colIndex > 0) {
            setActiveCell({ rowIndex, colIndex: colIndex - 1 });
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (colIndex < gridColumns.length - 1) {
            setActiveCell({ rowIndex, colIndex: colIndex + 1 });
          }
          break;
        case 'Tab':
          if (e.shiftKey) {
            e.preventDefault();
            if (colIndex > 0) {
              setActiveCell({ rowIndex, colIndex: colIndex - 1 });
            } else if (rowIndex > 0) {
              setActiveCell({ rowIndex: rowIndex - 1, colIndex: gridColumns.length - 1 });
            }
          } else {
            e.preventDefault();
            if (colIndex < gridColumns.length - 1) {
              setActiveCell({ rowIndex, colIndex: colIndex + 1 });
            } else if (rowIndex < paginatedRows.length - 1) {
              setActiveCell({ rowIndex: rowIndex + 1, colIndex: 0 });
            }
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (editingCell !== null) {
            // Save and move to next row (same column)
            handleCellChange(rowIndex, colIndex, editingValue);
            setEditingCell(null);
            setEditingValue(null);
            // Move to next row if exists
            if (rowIndex < paginatedRows.length - 1) {
              setActiveCell({ rowIndex: rowIndex + 1, colIndex });
            }
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (editingCell !== null) {
            setEditingCell(null);
            setEditingValue(null);
          }
          break;
        default:
          break;
      }
    },
    [gridColumns, paginatedRows, keyboardNavigation, editable, editingCell, editingValue, handleCellChange]
  );

  // Classes
  const containerClassName = clsx(
    'grid-table-root erp-surface rounded-lg overflow-hidden',
    compact && 'compact',
    className
  );

  const wrapperClassNameComputed = clsx(
    'grid-table-wrapper relative flex flex-col h-full bg-white',
    wrapperClassName
  );

  const gridInnerClassName = clsx(
    'grid-table-inner flex-1 overflow-x-auto relative',
    bordered && 'border border-slate-200'
  );

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
      aria-label="Enhanced data grid"
      suppressHydrationWarning
      style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}
      tabIndex={0}
      onKeyDown={(e) => {
        // Only handle navigation keys at container level when NOT editing
        if (editingCell === null && activeCell) {
          handleKeyDown(e as unknown as React.KeyboardEvent<HTMLElement>, activeCell.rowIndex, activeCell.colIndex);
        }
      }}
      onFocus={() => {
        if (!activeCell && paginatedRows.length > 0) {
          setActiveCell({ rowIndex: 0, colIndex: 0 });
        }
      }}
    >
      <div className={wrapperClassNameComputed}>
        {/* Header */}
        <div
          className="grid-table-header sticky top-0 bg-slate-50 border-b border-slate-200 z-20"
          style={{ height: `${headerHeight}px`, overflow: 'hidden' }}
        >
          <div ref={headerRef} className="flex h-full" style={{ minWidth: `${effectiveMinWidth}px` }}>
            {gridColumns.map((col, colIndex) => (
              <div
                key={`header-${col.key}`}
                className="flex items-center px-3 py-2 border-r border-slate-200 font-semibold text-sm text-slate-700"
                style={{
                  width: col.width || 100,
                  minWidth: col.width || 100,
                  textAlign: col.align || 'left',
                  ...(colIndex < 2
                    ? {
                      position: 'sticky' as const,
                      left: `${leftOffsets[colIndex]}px`,
                      zIndex: 40,
                      background: 'rgb(248, 250, 252)',
                    }
                    : {}),
                }}
              >
                {col.title}
              </div>
            ))}
          </div>
        </div>

        {/* Data grid with virtualization */}
        <div
          ref={tableContainerRef}
          className={gridInnerClassName}
          style={{ height: `calc(100% - ${headerHeight}px - 50px)` }} // Subtract header and pagination
          suppressHydrationWarning
          onScroll={(e) => {
            const target = e.currentTarget as HTMLDivElement;
            if (headerRef.current) {
              headerRef.current.scrollLeft = target.scrollLeft;
            }
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center p-8 h-full">
              <div className="text-slate-600">Loading...</div>
            </div>
          ) : paginatedRows.length === 0 ? (
            <div className="flex items-center justify-center p-8 h-full text-slate-500">
              {emptyMessage}
            </div>
          ) : (
            <div
              ref={virtualParentRef}
              className={rowsContainerClassName}
              style={{ minWidth: `${effectiveMinWidth}px` }}
            >
              {/* Virtual spacer top */}
              {paddingTop > 0 && (
                <div style={{ height: `${paddingTop}px` }} />
              )}

              {/* Virtualized rows */}
              {virtualRows.map((virtualRow) => {
                const row = paginatedRows[virtualRow.index];
                if (!row) return null;

                const displayIndex = virtualRow.index;

                return (
                  <div
                    key={`row-${row.original.id}-${displayIndex}`}
                    className={clsx(
                      'flex border-b border-slate-200',
                      striped && displayIndex % 2 === 0 && 'bg-slate-50',
                      hoverable && hoveredRow === displayIndex && 'bg-blue-50',
                      rowClassName && rowClassName(row.original, displayIndex)
                    )}
                    style={{
                      height: `${rowHeight}px`,
                      minWidth: `${effectiveMinWidth}px`,
                    }}
                    onMouseEnter={() => hoverable && setHoveredRow(displayIndex)}
                    onMouseLeave={() => hoverable && setHoveredRow(null)}
                    onClick={() => onRowClick?.(row.original.data, displayIndex)}
                  >
                    {gridColumns.map((col, colIndex) => {
                      const cellValue = getCellValue(row.original, col.key);
                      const displayValue = getCellDisplayValue(cellValue, col, row.original, displayIndex);
                      const isEditing =
                        editingCell?.rowIndex === displayIndex &&
                        editingCell?.colIndex === colIndex;
                      const isFocused =
                        activeCell?.rowIndex === displayIndex &&
                        activeCell?.colIndex === colIndex;

                      return (
                        <div
                          key={`cell-${row.original.id}-${col.key}`}
                          data-grid-row={displayIndex}
                          data-grid-col={colIndex}
                          tabIndex={isFocused ? 0 : -1}
                          onClick={() => setActiveCell({ rowIndex: displayIndex, colIndex })}
                          onFocus={() => setActiveCell({ rowIndex: displayIndex, colIndex })}
                          className={clsx(
                            'shrink-0 px-3 py-2 border-r border-slate-200 overflow-hidden',
                            'focus-within:ring-2 focus-within:ring-blue-500 focus-within:z-10',
                            isFocused && 'ring-2 ring-blue-500',
                            cellClassName && cellClassName(cellValue, row.original, displayIndex, colIndex)
                          )}
                          style={{
                            width: col.width || 100,
                            minWidth: col.width || 100,
                            height: '100%',
                            textAlign: col.align || 'left',
                            backgroundColor: 'white',
                            color: '#0f172a',
                            ...(colIndex < 2
                              ? {
                                position: 'sticky' as const,
                                left: `${leftOffsets[colIndex]}px`,
                                zIndex: 30,
                                background: 'white',
                              }
                              : {}),
                          }}
                        >
                          {isEditing && editable && isCellEditable(col) ? (
                            <input
                              autoFocus
                              type="text"
                              value={editingValue ?? ''}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onBlur={() => {
                                // Skip blur handling if we just entered edit mode (prevents immediate exit)
                                if (justEnteredEditRef.current) {
                                  justEnteredEditRef.current = false;
                                  return;
                                }
                                handleCellChange(displayIndex, colIndex, editingValue);
                                setEditingCell(null);
                                setEditingValue(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleCellChange(displayIndex, colIndex, editingValue);
                                  setEditingCell(null);
                                  setEditingValue(null);
                                  // Move to next row if exists
                                  if (displayIndex < paginatedRows.length - 1) {
                                    setActiveCell({ rowIndex: displayIndex + 1, colIndex });
                                  }
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  setEditingCell(null);
                                  setEditingValue(null);
                                } else if (e.key === 'Tab') {
                                  e.preventDefault();
                                  handleCellChange(displayIndex, colIndex, editingValue);
                                  setEditingCell(null);
                                  setEditingValue(null);
                                  // Move to next cell (or next row if at end)
                                  if (e.shiftKey) {
                                    if (colIndex > 0) {
                                      setActiveCell({ rowIndex: displayIndex, colIndex: colIndex - 1 });
                                    } else if (displayIndex > 0) {
                                      setActiveCell({ rowIndex: displayIndex - 1, colIndex: gridColumns.length - 1 });
                                    }
                                  } else {
                                    if (colIndex < gridColumns.length - 1) {
                                      setActiveCell({ rowIndex: displayIndex, colIndex: colIndex + 1 });
                                    } else if (displayIndex < paginatedRows.length - 1) {
                                      setActiveCell({ rowIndex: displayIndex + 1, colIndex: 0 });
                                    }
                                  }
                                }
                              }}
                              onFocus={(e) => e.currentTarget.select()}
                              className="w-full h-full px-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ textAlign: col.align || 'left' }}
                            />
                          ) : (
                            <div
                              tabIndex={0}
                              onKeyDown={(e) => {
                                // Prevent default scrolling for arrow/page keys
                                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', ' '].includes(e.key)) {
                                  e.preventDefault();
                                }

                                // Handle navigation keys
                                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                                  handleKeyDown(e as any, displayIndex, colIndex);
                                } else if (e.key === 'Enter') {
                                  // Enter: enter edit mode without any initial value
                                  if (editable && isCellEditable(col)) {
                                    const cellValue = getCellValue(row.original, col.key);
                                    setEditingCell({ rowIndex: displayIndex, colIndex });
                                    setEditingValue(cellValue);
                                  }
                                } else if (e.key === 'Escape') {
                                  // Escape: do nothing on cell div (might be used later)
                                } else if (editable && isCellEditable(col) && editingCell === null) {
                                  // Any other printable key: enter edit mode with initial value
                                  const cellValue = getCellValue(row.original, col.key);
                                  setEditingCell({ rowIndex: displayIndex, colIndex });
                                  setEditingValue(cellValue + e.key);
                                }
                              }}
                              className={clsx(
                                'w-full h-full flex items-center cursor-default outline-none',
                                isFocused && 'ring-2 ring-inset ring-blue-500 rounded px-1',
                                'text-slate-900'
                              )}
                            >
                              {displayValue}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Virtual spacer bottom */}
              {paddingBottom > 0 && (
                <div style={{ height: `${paddingBottom}px` }} />
              )}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="grid-table-pagination flex items-center justify-between gap-4 p-3 bg-slate-50 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            <span>
              Page {pagination.pageIndex + 1} of{' '}
              {Math.ceil(normalizedData.length / ROWS_PER_PAGE) || 1} (
              {normalizedData.length} total rows)
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={clsx(
                'px-3 py-1 text-sm border rounded',
                table.getCanPreviousPage()
                  ? 'border-slate-300 bg-white hover:bg-slate-50'
                  : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
              )}
            >
              ← Previous
            </button>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={clsx(
                'px-3 py-1 text-sm border rounded',
                table.getCanNextPage()
                  ? 'border-slate-300 bg-white hover:bg-slate-50'
                  : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
              )}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

GridTableEnhanced.displayName = 'GridTableEnhanced';
