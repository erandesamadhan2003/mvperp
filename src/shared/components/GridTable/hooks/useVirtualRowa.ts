/**
 * Virtual row hook for large datasets
 * Optimizes rendering performance for thousands of rows
 * Based on react-window principles but simplified for grid tables
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface UseVirtualRowOptions {
    /** Total number of rows */
    itemCount: number;

    /** Height of each row */
    itemHeight: number;

    /** Height of container */
    containerHeight: number;

    /** Number of items to render outside visible area */
    overscan?: number;

    /** Scroll container ref */
    scrollRef?: React.RefObject<HTMLDivElement>;

    /** Custom scroll position (for controlled scrolling) */
    scrollOffset?: number;

    /** Enable virtualization */
    enabled?: boolean;
}

interface VirtualItem {
    /** Row index */
    index: number;

    /** Vertical offset from top */
    offset: number;

    /** Size (height) of item */
    size: number;
}

interface UseVirtualRowReturn {
    /** Visible items to render */
    visibleItems: VirtualItem[];

    /** Total height of all items */
    totalHeight: number;

    /** Current scroll offset */
    scrollOffset: number;

    /** Handle scroll event */
    handleScroll: (offset: number) => void;

    /** Get item offset */
    getItemOffset: (index: number) => number;

    /** Get start index of visible items */
    startIndex: number;

    /** Get end index of visible items */
    endIndex: number;

    /** Whether virtualization is effectively used */
    isVirtualized: boolean;

    /** Range to render vertically */
    offsetY: number;
}

/**
 * Hook for virtualizing grid rows
 * Renders only visible rows for performance with large datasets
 */
export function useVirtualRow(
    options: UseVirtualRowOptions
): UseVirtualRowReturn {
    const {
        itemCount,
        itemHeight,
        containerHeight,
        overscan = 3,
        scrollRef,
        scrollOffset: controlledScrollOffset,
        enabled = true,
    } = options;

    const [scrollOffset, setScrollOffset] = useState(0);
    const scrollRefInternal = useRef<number>(controlledScrollOffset ?? 0);

    // Use controlled offset if provided, otherwise use internal state
    const currentScrollOffset =
        controlledScrollOffset !== undefined ? controlledScrollOffset : scrollOffset;

    // Calculate visible range
    const startIndex = useMemo(() => {
        if (!enabled) return 0;

        const index = Math.max(
            0,
            Math.floor(currentScrollOffset / itemHeight) - overscan
        );

        return index;
    }, [currentScrollOffset, itemHeight, overscan, enabled]);

    const endIndex = useMemo(() => {
        if (!enabled) return itemCount - 1;

        const index = Math.min(
            itemCount - 1,
            Math.ceil((currentScrollOffset + containerHeight) / itemHeight) +
            overscan
        );

        return index;
    }, [
        currentScrollOffset,
        containerHeight,
        itemHeight,
        overscan,
        itemCount,
        enabled,
    ]);

    // Generate visible items
    const visibleItems = useMemo(() => {
        const items: VirtualItem[] = [];

        if (!enabled) {
            // When virtualization is disabled, render all items
            for (let i = 0; i < itemCount; i++) {
                items.push({
                    index: i,
                    offset: i * itemHeight,
                    size: itemHeight,
                });
            }
            return items;
        }

        for (let i = startIndex; i <= endIndex; i++) {
            if (i >= 0 && i < itemCount) {
                items.push({
                    index: i,
                    offset: i * itemHeight,
                    size: itemHeight,
                });
            }
        }

        return items;
    }, [startIndex, endIndex, itemCount, itemHeight, enabled]);

    // Total height
    const totalHeight = useMemo(() => {
        return itemCount * itemHeight;
    }, [itemCount, itemHeight]);

    // Offset for positioning visible items
    const offsetY = useMemo(() => {
        return visibleItems.length > 0 ? visibleItems[0].offset : 0;
    }, [visibleItems]);

    // Handle scroll event
    const handleScroll = useCallback(
        (offset: number) => {
            const clampedOffset = Math.max(0, Math.min(offset, totalHeight - containerHeight));

            if (controlledScrollOffset === undefined) {
                setScrollOffset(clampedOffset);
            }

            scrollRefInternal.current = clampedOffset;
        },
        [totalHeight, containerHeight, controlledScrollOffset]
    );

    // Update internal scroll offset when controlled offset changes
    useEffect(() => {
        if (controlledScrollOffset !== undefined) {
            scrollRefInternal.current = controlledScrollOffset;
        }
    }, [controlledScrollOffset]);

    // Get item offset
    const getItemOffset = useCallback(
        (index: number): number => {
            return index * itemHeight;
        },
        [itemHeight]
    );

    // Whether virtualization is effectively being used
    const isVirtualized = useMemo(() => {
        return enabled && totalHeight > containerHeight;
    }, [enabled, totalHeight, containerHeight]);

    return {
        visibleItems,
        totalHeight,
        scrollOffset: currentScrollOffset,
        handleScroll,
        getItemOffset,
        startIndex,
        endIndex,
        isVirtualized,
        offsetY,
    };
}

/**
 * Hook for handling scroll event on container
 */
export function useVirtualScroll(
    scrollRef: React.RefObject<HTMLDivElement | null>,
    onScroll: (offset: number) => void
) {
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const handleScroll = () => {
            onScroll(container.scrollTop);
        };

        container.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [scrollRef, onScroll]);
}

/**
 * Hook to estimate item size for variable height rows
 * Useful for virtualization with dynamic row heights
 */
export function useVariableItemSize(
    itemCount: number,
    estimatedItemSize: number = 32,
    getItemSize?: (index: number) => number,
    containerHeight: number = 600,
    overscan: number = 3
) {
    const sizeCacheRef = useRef<Map<number, number>>(new Map());
    const [scrollOffset, setScrollOffset] = useState(0);

    const getSize = useCallback(
        (index: number): number => {
            if (getItemSize) {
                if (!sizeCacheRef.current.has(index)) {
                    sizeCacheRef.current.set(index, getItemSize(index));
                }
                return sizeCacheRef.current.get(index) || estimatedItemSize;
            }
            return estimatedItemSize;
        },
        [getItemSize, estimatedItemSize]
    );

    const getTotalSize = useCallback((): number => {
        let total = 0;
        for (let i = 0; i < itemCount; i++) {
            total += getSize(i);
        }
        return total;
    }, [itemCount, getSize]);

    const getStartIndex = useCallback((): number => {
        let offset = 0;
        for (let i = 0; i < itemCount; i++) {
            if (offset >= scrollOffset - estimatedItemSize * overscan) {
                return Math.max(0, i - overscan);
            }
            offset += getSize(i);
        }
        return itemCount - 1;
    }, [scrollOffset, itemCount, getSize, estimatedItemSize, overscan]);

    const getEndIndex = useCallback((): number => {
        let offset = 0;
        const targetOffset = scrollOffset + containerHeight;

        for (let i = 0; i < itemCount; i++) {
            offset += getSize(i);
            if (offset >= targetOffset) {
                return Math.min(itemCount - 1, i + overscan);
            }
        }
        return itemCount - 1;
    }, [scrollOffset, containerHeight, itemCount, getSize, overscan]);

    return {
        scrollOffset,
        setScrollOffset,
        getSize,
        getTotalSize,
        getStartIndex,
        getEndIndex,
    };
}
