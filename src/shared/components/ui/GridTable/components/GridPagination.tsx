import * as React from "react";

import { useGridContext } from "../context/useGridContext";

type PageItem = number | "ellipsis";

function getPageItems(currentPage: number, totalPages: number): PageItem[] {
    if (totalPages <= 0) return [];
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);

    // At most 5 numeric buttons; show ellipsis for gaps.
    //
    // Cases:
    // - Near start: 1 2 3 4 ... N
    // - Near end:   1 ... N-3 N-2 N-1 N
    // - Middle:     1 ... P-1 P P+1 ... N
    if (currentPage <= 3) {
        return [1, 2, 3, 4, "ellipsis", totalPages];
    }
    if (currentPage >= totalPages - 2) {
        return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

/**
 * GridPagination component for GridTable.
 *
 * Consumes pagination state from GridContext (no props) and renders:
 * - Left: "Showing X–Y of Z rows"
 * - Center: Previous/Next + page pills with ellipsis
 * - Right: page size selector
 */
export const GridPagination = React.memo(function GridPagination() {
    const { pagination, setPage, setPageSize, pageSizeOptions } = useGridContext();

    const items = React.useMemo(() => getPageItems(pagination.page, pagination.totalPages), [pagination.page, pagination.totalPages]);

    const containerStyle: React.CSSProperties = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: "1px solid #e0e0e0",
        padding: "8px 12px",
        background: "#ffffff",
        gap: 12
    };

    const mutedTextStyle: React.CSSProperties = {
        fontSize: 13,
        color: "#666666"
    };

    const buttonBaseStyle: React.CSSProperties = {
        border: "1px solid #d0d0d0",
        background: "#ffffff",
        padding: "4px 10px",
        borderRadius: 6,
        fontSize: 13,
        cursor: "pointer",
        userSelect: "none"
    };

    const navButtonStyle: React.CSSProperties = {
        ...buttonBaseStyle,
        padding: "4px 10px"
    };

    const disabledStyle: React.CSSProperties = {
        opacity: 0.4,
        pointerEvents: "none"
    };

    return (
        <div style={containerStyle}>
            <div style={mutedTextStyle}>
                Showing {pagination.pageStart}–{pagination.pageEnd} of {pagination.total} rows
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                    type="button"
                    aria-label="Go to previous page"
                    onClick={() => setPage(pagination.page - 1)}
                    style={{ ...navButtonStyle, ...(pagination.hasPrevPage ? undefined : disabledStyle) }}
                >
                    Previous
                </button>

                {items.map((item, idx) => {
                    if (item === "ellipsis") {
                        return (
                            <span key={`ellipsis-${idx}`} style={{ ...mutedTextStyle, padding: "0 6px" }} aria-hidden="true">
                                ...
                            </span>
                        );
                    }

                    const isActive = item === pagination.page;
                    const pageButtonStyle: React.CSSProperties = {
                        ...buttonBaseStyle,
                        minWidth: 34,
                        textAlign: "center",
                        background: isActive ? "#0078d4" : "#ffffff",
                        color: isActive ? "#ffffff" : "#111111",
                        borderColor: isActive ? "#0078d4" : "#d0d0d0"
                    };

                    return (
                        <button
                            key={item}
                            type="button"
                            aria-label={`Go to page ${item}`}
                            onClick={() => setPage(item)}
                            style={pageButtonStyle}
                        >
                            {item}
                        </button>
                    );
                })}

                <button
                    type="button"
                    aria-label="Go to next page"
                    onClick={() => setPage(pagination.page + 1)}
                    style={{ ...navButtonStyle, ...(pagination.hasNextPage ? undefined : disabledStyle) }}
                >
                    Next
                </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={mutedTextStyle}>Rows per page:</span>
                <select
                    aria-label="Rows per page"
                    value={pagination.pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    style={{
                        border: "1px solid #d0d0d0",
                        borderRadius: 6,
                        padding: "4px 8px",
                        fontSize: 13,
                        background: "#ffffff"
                    }}
                >
                    {pageSizeOptions.map((size) => (
                        <option key={size} value={size}>
                            {size}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
});

