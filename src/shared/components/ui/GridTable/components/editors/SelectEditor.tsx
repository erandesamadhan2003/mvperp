import * as React from "react";

import type { EditorBaseProps } from "../../types/cell.types";

/**
 * SelectEditor — native <select> editor for GridTable select-type columns.
 *
 * Pattern contract:
 * - Maintains a local draft value.
 * - Commits on blur.
 * - For <select>, a change is treated as immediate confirmation (commit onChange).
 * - Escape discards (no commit) and exits via navigation intent.
 */
export function SelectEditor(props: EditorBaseProps) {
    const { column, value, rowIndex, colIndex, onCommit, onNavigate } = props;

    const options = column.options ?? [];

    const [localValue, setLocalValue] = React.useState<string>(() => {
        if (value == null) return "";
        return String(value);
    });

    const selectRef = React.useRef<HTMLSelectElement | null>(null);

    React.useEffect(() => {
        selectRef.current?.focus();
    }, []);

    const commit = React.useCallback(
        (rawValue?: string) => {
            const nextRaw = rawValue ?? localValue;
            const selectedOption = options.find((opt) => String(opt.value) === nextRaw);
            const newValue = nextRaw === "" ? null : (selectedOption?.value ?? nextRaw);

            onCommit({
                rowIndex,
                colIndex,
                key: column.key,
                oldValue: value,
                newValue
            });
        },
        [colIndex, column.key, localValue, onCommit, options, rowIndex, value]
    );

    const handleBlur = React.useCallback(() => {
        commit();
    }, [commit]);

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLSelectElement>) => {
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
            }
        },
        [commit, onNavigate]
    );

    return (
        <select
            ref={selectRef}
            value={localValue}
            onChange={(e) => {
                const next = e.target.value;
                setLocalValue(next);
                commit(next);
            }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{
                width: "100%",
                height: "100%",
                border: "none",
                outline: "none",
                appearance: "auto",
                padding: "0 4px",
                font: "inherit",
                background: "inherit"
            }}
        >
            <option value="">— select —</option>
            {options.map((opt) => (
                <option key={String(opt.value)} value={String(opt.value)}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}

