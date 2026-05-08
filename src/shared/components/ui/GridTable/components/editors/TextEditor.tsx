import * as React from "react";

import type { EditorBaseProps } from "../../types/cell.types";

/**
 * TextEditor — the base cell editor for GridTable text columns.
 *
 * Behavior contract (used as the pattern for all editors):
 * - Maintains a local draft value while editing.
 * - Commits on blur, Enter, and Tab.
 * - Escape discards the draft (no commit) and exits via navigation intent.
 */
export function TextEditor(props: EditorBaseProps) {
    const { column, value, rowIndex, colIndex, onCommit, onNavigate } = props;

    const [localValue, setLocalValue] = React.useState<string>(() => (value == null ? "" : String(value)));
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
            newValue: localValue
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
                    return;
                }
            }
        },
        [commit, localValue.length, onNavigate]
    );

    return (
        <input
            ref={inputRef}
            type="text"
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

