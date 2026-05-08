import * as React from "react";

import type { EditorBaseProps } from "../../types/cell.types";

/**
 * NumberEditor — base cell editor for numeric GridTable columns.
 *
 * Follows the same contract as TextEditor:
 * - Maintains a local draft value while editing.
 * - Commits on blur, Enter, and Tab.
 * - Escape discards the draft (no commit) and exits via navigation intent.
 */
export function NumberEditor(props: EditorBaseProps) {
    const { column, value, rowIndex, colIndex, onCommit, onNavigate } = props;

    const [localValue, setLocalValue] = React.useState<number | "">(() => {
        if (typeof value === "number") return value;
        if (typeof value === "string") {
            const n = parseFloat(value);
            return Number.isNaN(n) ? "" : n;
        }
        return "";
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
            newValue: localValue === "" ? null : localValue
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

            if (
                e.key === "ArrowLeft" ||
                e.key === "ArrowRight" ||
                e.key === "ArrowUp" ||
                e.key === "ArrowDown"
            ) {
                const el = inputRef.current;
                if (!el) return;

                const text = el.value ?? "";
                const len = text.length;
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
                    return;
                }
            }
        },
        [commit, onNavigate]
    );

    return (
        <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={typeof column.min === "number" ? column.min : undefined}
            max={typeof column.max === "number" ? column.max : undefined}
            value={localValue}
            onChange={(e) => {
                const next = e.target.value;
                if (next === "") {
                    setLocalValue("");
                    return;
                }
                const n = parseFloat(next);
                setLocalValue(Number.isNaN(n) ? "" : n);
            }}
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

