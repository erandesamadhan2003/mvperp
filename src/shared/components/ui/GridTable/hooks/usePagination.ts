import { useCallback, useEffect, useMemo, useState } from "react";

import type { PaginationConfig, PaginationState } from "../types/pagination.types";

const DEFAULT_PAGE_SIZE = 50;

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(value, max));
}

/**
 * Manages GridTable pagination state.
 *
 * @param total Total number of rows.
 * @param config Optional pagination configuration.
 */
export function usePagination(total: number, config?: PaginationConfig) {
    const [page, setPageState] = useState<number>(1);
    const [pageSize, setPageSizeState] = useState<number>(config?.defaultPageSize ?? DEFAULT_PAGE_SIZE);

    /**
     * Total number of pages.
     *
     * Note: We keep this at least 1 to preserve the invariant that `page` is
     * always in the [1..totalPages] range, even when `total` is 0.
     */
    const totalPages = useMemo(() => {
        if (pageSize <= 0) return 1;
        return Math.max(1, Math.ceil(total / pageSize));
    }, [total, pageSize]);

    /**
     * Whether there is a previous page.
     */
    const hasPrevPage = useMemo(() => page > 1, [page]);

    /**
     * Whether there is a next page.
     */
    const hasNextPage = useMemo(() => page < totalPages, [page, totalPages]);

    /**
     * 1-based index of the first item on the current page, for display.
     */
    const pageStart = useMemo(() => {
        if (total <= 0) return 0;
        return (page - 1) * pageSize + 1;
    }, [page, pageSize, total]);

    /**
     * 1-based index of the last item on the current page, for display.
     */
    const pageEnd = useMemo(() => {
        if (total <= 0) return 0;
        return Math.min(page * pageSize, total);
    }, [page, pageSize, total]);

    /**
     * Page size options shown to users.
     */
    const pageSizeOptions = useMemo(() => config?.pageSizeOptions ?? [20, 50, 100, 200], [config?.pageSizeOptions]);

    useEffect(() => {
        setPageState(current => clamp(current, 1, totalPages));
    }, [totalPages]);

    const setPage = useCallback(
        (nextPage: number) => {
            const clamped = clamp(nextPage, 1, totalPages);
            setPageState(clamped);
            config?.onPageChange?.(clamped, pageSize);
        },
        [config, pageSize, totalPages]
    );

    const setPageSize = useCallback(
        (size: number) => {
            const nextSize = size > 0 ? size : DEFAULT_PAGE_SIZE;
            setPageSizeState(nextSize);
            config?.onPageSizeChange?.(nextSize);

            // Reset to page 1 to avoid landing on an out-of-range page.
            setPageState(1);
        },
        [config]
    );

    const pagination: PaginationState = useMemo(
        () => ({
            page,
            pageSize,
            total,
            totalPages,
            hasPrevPage,
            hasNextPage,
            pageStart,
            pageEnd
        }),
        [page, pageSize, total, totalPages, hasPrevPage, hasNextPage, pageStart, pageEnd]
    );

    return {
        page,
        pageSize,
        total,
        pagination,
        totalPages,
        hasPrevPage,
        hasNextPage,
        pageStart,
        pageEnd,
        pageSizeOptions,
        setPage,
        setPageSize
    };
}
