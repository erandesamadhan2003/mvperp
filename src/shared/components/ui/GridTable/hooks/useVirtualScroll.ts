import { useCallback, useMemo, useState } from "react";

import type * as React from "react";

/**
 * Virtual scrolling for GridTable.
 *
 * Technique:
 * - A "phantom" spacer with `height = totalRows * rowHeight` creates a scrollbar
 *   as if all rows were rendered.
 * - Only the visible window `[startIndex..endIndex]` is actually rendered.
 * - The visible rows wrapper is positioned via `translateY(offsetY)` so it
 *   appears at the correct scroll position.
 *
 * Overscan:
 * - Rendering a few extra rows above and below the viewport reduces flicker
 *   during fast scrolling because the next rows are already mounted.
 */
export function useVirtualScroll(totalRows: number, rowHeight: number, containerHeight: number) {
    const [scrollTop, setScrollTop] = useState<number>(0);

    const overscan = useMemo(() => 3, []);

    const safeRowHeight = useMemo(() => (rowHeight > 0 ? rowHeight : 1), [rowHeight]);
    const safeContainerHeight = useMemo(() => (containerHeight > 0 ? containerHeight : 0), [containerHeight]);

    const rawStart = useMemo(() => Math.floor(scrollTop / safeRowHeight), [scrollTop, safeRowHeight]);
    const startIndex = useMemo(() => Math.max(0, rawStart - overscan), [rawStart, overscan]);

    const rawEnd = useMemo(
        () => Math.floor((scrollTop + safeContainerHeight) / safeRowHeight),
        [scrollTop, safeContainerHeight, safeRowHeight]
    );

    const endIndex = useMemo(() => {
        if (totalRows <= 0) return -1;
        return Math.min(totalRows - 1, rawEnd + overscan);
    }, [rawEnd, overscan, totalRows]);

    const visibleCount = useMemo(() => {
        if (totalRows <= 0 || endIndex < startIndex) return 0;
        return endIndex - startIndex + 1;
    }, [endIndex, startIndex, totalRows]);

    const totalHeight = useMemo(() => Math.max(0, totalRows) * safeRowHeight, [totalRows, safeRowHeight]);

    const offsetY = useMemo(() => startIndex * safeRowHeight, [startIndex, safeRowHeight]);

    const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);

    return { startIndex, endIndex, visibleCount, totalHeight, offsetY, onScroll };
}
