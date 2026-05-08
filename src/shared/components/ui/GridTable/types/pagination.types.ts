/**
 * Current pagination state for the GridTable.
 */
export interface PaginationState {
    /**
     * Current page number (typically 1-based).
     */
    page: number;

    /**
     * Number of rows per page.
     */
    pageSize: number;

    /**
     * Total number of rows available across all pages.
     */
    total: number;

    /**
     * Total number of pages.
     */
    totalPages: number;

    /**
     * Whether there is a previous page.
     */
    hasPrevPage: boolean;

    /**
     * Whether there is a next page.
     */
    hasNextPage: boolean;

    /**
     * 1-based index of the first row on the current page (0 when total is 0).
     */
    pageStart: number;

    /**
     * 1-based index of the last row on the current page (0 when total is 0).
     */
    pageEnd: number;
}

/**
 * Optional pagination configuration for the GridTable.
 */
export interface PaginationConfig {
    /**
     * Default page size used when initializing pagination.
     * If omitted, the grid should treat this as 50.
     */
    defaultPageSize?: number;

    /**
     * Available page size options presented to the user.
     * If omitted, the grid should treat this as [20, 50, 100, 200].
     */
    pageSizeOptions?: number[];

    /**
     * Callback invoked when the current page changes.
     * @param page The next page number.
     * @param pageSize The current page size at the time of the change.
     */
    onPageChange?: (page: number, pageSize: number) => void;

    /**
     * Callback invoked when the page size changes.
     * @param size The new page size.
     */
    onPageSizeChange?: (size: number) => void;

    /**
     * Whether to show the page size selector UI.
     */
    showPageSizeSelector?: boolean;

    /**
     * Whether to display the total count UI (e.g., "Total: 123").
     */
    showTotalCount?: boolean;
}
