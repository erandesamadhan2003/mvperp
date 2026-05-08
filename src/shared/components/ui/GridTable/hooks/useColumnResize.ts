import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { GridColumn } from "../types/column.types";

const DEFAULT_WIDTH = 120;
const DEFAULT_MIN_WIDTH = 40;
const DEFAULT_MAX_WIDTH = 600;

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(value, max));
}

/**
 * Manages column widths and mouse-drag resizing.
 *
 * Window-level listeners are used so the resize interaction continues working
 * even when the cursor leaves the header cell during drag.
 */
export function useColumnResize(columns: GridColumn[]) {
    const columnsByKey = useMemo(() => {
        const map = new Map<string, GridColumn>();
        for (const col of columns) map.set(col.key, col);
        return map;
    }, [columns]);

    const [widths, setWidths] = useState<Map<string, number>>(() => {
        const initial = new Map<string, number>();
        for (const col of columns) {
            initial.set(col.key, col.width ?? col.minWidth ?? DEFAULT_WIDTH);
        }
        return initial;
    });

    const widthsRef = useRef(widths);

    useEffect(() => {
        widthsRef.current = widths;
    }, [widths]);

    // Keep map keys in sync with columns list.
    useEffect(() => {
        setWidths(prev => {
            const next = new Map<string, number>();
            for (const col of columns) {
                const existing = prev.get(col.key);
                next.set(col.key, existing ?? col.width ?? col.minWidth ?? DEFAULT_WIDTH);
            }
            return next;
        });
    }, [columns]);

    const dragKeyRef = useRef<string | null>(null);
    const startXRef = useRef<number>(0);
    const startWidthRef = useRef<number>(DEFAULT_WIDTH);
    const previousUserSelectRef = useRef<string>("");

    const onMouseMove = useCallback(
        (e: MouseEvent) => {
            const colKey = dragKeyRef.current;
            if (!colKey) return;

            const col = columnsByKey.get(colKey);
            const minW = col?.minWidth ?? DEFAULT_MIN_WIDTH;
            const maxW = col?.maxWidth ?? DEFAULT_MAX_WIDTH;

            const delta = e.clientX - startXRef.current;
            const nextWidth = clamp(startWidthRef.current + delta, minW, maxW);

            setWidths(prev => {
                const next = new Map(prev);
                next.set(colKey, nextWidth);
                return next;
            });
        },
        [columnsByKey]
    );

    const stopDrag = useCallback(() => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", stopDrag);

        dragKeyRef.current = null;
        document.body.style.userSelect = previousUserSelectRef.current;
    }, [onMouseMove]);

    /**
     * Starts resizing a column from a given pointer position.
     *
     * Adds `mousemove`/`mouseup` listeners on `window` so the drag interaction
     * keeps working if the cursor leaves the resizer element.
     */
    const startResize = useCallback(
        (colKey: string, startX: number) => {
            const currentWidths = widthsRef.current;
            const startWidth = currentWidths.get(colKey) ?? columnsByKey.get(colKey)?.width ?? DEFAULT_WIDTH;

            dragKeyRef.current = colKey;
            startXRef.current = startX;
            startWidthRef.current = startWidth;

            previousUserSelectRef.current = document.body.style.userSelect;
            document.body.style.userSelect = "none";

            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", stopDrag);
        },
        [columnsByKey, onMouseMove, stopDrag]
    );

    /**
     * Resets a column width to its configured base width.
     */
    const resetColumnWidth = useCallback(
        (colKey: string) => {
            const baseWidth = columnsByKey.get(colKey)?.width ?? DEFAULT_WIDTH;
            setWidths(prev => {
                const next = new Map(prev);
                next.set(colKey, baseWidth);
                return next;
            });
        },
        [columnsByKey]
    );

    // Cleanup in case the component unmounts mid-drag.
    useEffect(() => {
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", stopDrag);
            document.body.style.userSelect = previousUserSelectRef.current;
        };
    }, [onMouseMove, stopDrag]);

    return { widths, startResize, resetColumnWidth };
}
