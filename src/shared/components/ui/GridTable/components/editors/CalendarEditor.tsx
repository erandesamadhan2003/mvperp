import * as React from "react";

import type { EditorBaseProps } from "../../types/cell.types";

function formatDateForInput(value: unknown): string {
    if (!(value instanceof Date)) return "";
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function parseInputDate(value: string): Date | null {
    if (!value) return null;
    const [y, m, d] = value.split("-").map((p) => Number(p));
    if (!y || !m || !d) return null;
    const date = new Date(y, m - 1, d);
    return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * CalendarEditor — base editor for GridTable calendar/date columns.
 *
 * Follows the same contract as TextEditor:
 * - Maintains a local draft value.
 * - Commits on blur, Enter, and Tab.
 * - Escape discards the draft (no commit) and exits via navigation intent.
 */
export function CalendarEditor(props: EditorBaseProps) {
    const { column, value, rowIndex, colIndex, onCommit, onNavigate } = props;

    const [localValue, setLocalValue] = React.useState<string>(() => {
        if (typeof value === "string") return value;
        return formatDateForInput(value);
    });

    const inputRef = React.useRef<HTMLInputElement | null>(null);

    React.useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const commit = React.useCallback(() => {
        onCommit({
            rowIndex,
            colIndex,
            key: column.key,
            oldValue: value,
            newValue: parseInputDate(localValue)
        });
    }, [colIndex, column.key, localValue, onCommit, rowIndex, value]);

    const handleBlur = React.useCallback(() => {
        commit();
    }, [commit]);

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                commit();
                onNavigate("enter");
                return;
            }

            if (e.key === "Tab") {
                e.preventDefault();
                e.stopPropagation();
                commit();
                onNavigate(e.shiftKey ? "shiftTab" : "tab");
                return;
            }

            if (e.key === "Escape") {
                e.stopPropagation();
                onNavigate("escape");
                return;
            }

            if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown") {
                const el = inputRef.current;
                if (!el) return;

                const len = localValue.length;
                const start = el.selectionStart ?? 0;
                const end = el.selectionEnd ?? 0;
                const isEmpty = len === 0;
                const caretAtStart = start === 0 && end === 0;
                const caretAtEnd = start === len && end === len;
                const selectionTouchesStart = start === 0;
                const selectionTouchesEnd = end === len;

                if (e.key === "ArrowLeft" && (isEmpty || selectionTouchesStart)) {
                    e.preventDefault();
                    e.stopPropagation();
                    onNavigate("left");
                    return;
                }
                if (e.key === "ArrowRight" && (isEmpty || selectionTouchesEnd)) {
                    e.preventDefault();
                    e.stopPropagation();
                    onNavigate("right");
                    return;
                }
                if (e.key === "ArrowUp" && (isEmpty || caretAtStart || caretAtEnd)) {
                    e.preventDefault();
                    e.stopPropagation();
                    onNavigate("up");
                    return;
                }
                if (e.key === "ArrowDown" && (isEmpty || caretAtStart || caretAtEnd)) {
                    e.preventDefault();
                    e.stopPropagation();
                    onNavigate("down");
                }
            }
        },
        [commit, localValue.length, onNavigate]
    );

    return (
        <input
            ref={inputRef}
            type="date"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{
                width: "100%",
                height: "100%",
                border: "none",
                outline: "none",
                padding: "0 4px",
                font: "inherit",
                background: "inherit"
            }}
        />
    );
}

