import * as React from "react";

import { useGridContext } from "../context/useGridContext";
import { getColumnStyle, getFixedColumnOffsets } from "../utils/columnHelpers";

import type { GridColumn } from "../types/column.types";

/**
 * Grid header row for GridTable.
 *
 * Renders an ARIA row (`role="row"`) with one `role="columnheader"` element per
 * column. Uses column widths from GridContext, applies sticky offsets for fixed
 * columns, and provides a right-edge resize handle that listens on `window` via
 * the provider's resize hook.
 */
export interface GridHeaderProps {
    /**
     * Columns to render in this header.
     */
    columns: GridColumn[];

    /**
     * When true, the header is for the fixed zone and should float above scroll content.
     */
    fixed?: boolean;
}

export const GridHeader = React.memo(function GridHeader(props: GridHeaderProps) {
    const { columns, fixed } = props;

    const { columnWidths, startColumnResize } = useGridContext();

    const offsets = React.useMemo(() => {
        return getFixedColumnOffsets(columns, columnWidths);
    }, [columns, columnWidths]);

    const handleSort = React.useCallback((_colKey: string) => {
        // Stub: sorting is not wired yet.
    }, []);

    return (
        <div
            role="row"
            aria-rowindex={0}
            style={{
                position: "sticky",
                top: 0,
                zIndex: fixed ? 3 : 1,
                display: "flex"
            }}
        >
            {columns.map((col, colIndex) => {
                const baseStyle: React.CSSProperties = {
                    position: "relative",
                    background: "var(--header-bg, #f5f5f5)",
                    borderBottom: "2px solid #d0d0d0",
                    fontWeight: 600,
                    fontSize: "13px",
                    userSelect: "none",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    display: "flex",
                    alignItems: "center"
                };

                const style = {
                    ...baseStyle,
                    ...getColumnStyle(col, columnWidths, offsets)
                };

                return (
                    <div
                        key={col.key}
                        role="columnheader"
                        aria-colindex={colIndex + 1}
                        style={style}
                    >
                        <span title={col.header} style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                            {col.header}
                        </span>

                        {col.sortable ? (
                            <span
                                onClick={() => handleSort(col.key)}
                                style={{ marginLeft: 6, cursor: "pointer", fontSize: "11px" }}
                                aria-label={`Sort ${col.header}`}
                                role="button"
                                tabIndex={0}
                            >
                                ▲▼
                            </span>
                        ) : null}

                        <div
                            aria-hidden
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                startColumnResize(col.key, e.clientX);
                            }}
                            style={{
                                position: "absolute",
                                right: 0,
                                top: 0,
                                width: 4,
                                height: "100%",
                                cursor: "col-resize"
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
});
