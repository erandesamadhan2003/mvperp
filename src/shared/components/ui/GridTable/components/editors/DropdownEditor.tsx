import * as React from "react";
import * as ReactDOM from "react-dom";

import type { EditorBaseProps } from "../../types/cell.types";
import type { SelectOption } from "../../types/column.types";

type PortalPosition = {
    top: number;
    left: number;
    width: number;
};

function coerceToString(value: unknown): string {
    if (value == null) return "";
    return String(value);
}

function findSelectedOption(options: SelectOption[], value: unknown): SelectOption | undefined {
    const v = coerceToString(value);
    if (!v) return undefined;
    return options.find((opt) => coerceToString(opt.value) === v);
}

/**
 * DropdownEditor — searchable dropdown for GridTable using a body portal.
 *
 * The option list is rendered with `ReactDOM.createPortal` into `document.body`
 * so it can escape `overflow: hidden`/scroll containers used by the grid.
 */
export function DropdownEditor(props: EditorBaseProps) {
    const { column, value, rowIndex, colIndex, onCommit, onNavigate } = props;

    const options = React.useMemo(() => (Array.isArray(column.options) ? column.options : []), [column.options]);
    const selected = React.useMemo(() => findSelectedOption(options, value), [options, value]);

    const [open, setOpen] = React.useState<boolean>(false);
    const [search, setSearch] = React.useState<string>("");
    const [highlightedIndex, setHighlightedIndex] = React.useState<number>(0);
    const [position, setPosition] = React.useState<PortalPosition | null>(null);

    const cellRef = React.useRef<HTMLDivElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const portalRef = React.useRef<HTMLUListElement | null>(null);
    const searchRef = React.useRef<HTMLInputElement | null>(null);
    const blurTimerRef = React.useRef<number | null>(null);

    const filteredOptions = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return options;
        return options.filter((opt) => opt.label.toLowerCase().includes(q));
    }, [options, search]);

    const computePosition = React.useCallback(() => {
        const el = cellRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width
        });
    }, []);

    const close = React.useCallback(() => {
        setOpen(false);
        setSearch("");
    }, []);

    const commitOption = React.useCallback(
        (opt: SelectOption) => {
            onCommit({
                rowIndex,
                colIndex,
                key: column.key,
                oldValue: value,
                newValue: opt.value
            });
            close();
        },
        [close, colIndex, column.key, onCommit, rowIndex, value]
    );

    React.useEffect(() => {
        if (!open) return;

        computePosition();
        setHighlightedIndex(0);

        // Let the portal mount before focusing.
        const id = window.setTimeout(() => {
            searchRef.current?.focus();
            searchRef.current?.select();
        }, 0);

        return () => window.clearTimeout(id);
    }, [computePosition, open]);

    React.useEffect(() => {
        if (!open) return;

        const handleMouseDown = (e: MouseEvent) => {
            const target = e.target as Node | null;
            if (!target) return;
            if (cellRef.current?.contains(target)) return;
            if (portalRef.current?.contains(target)) return;
            close();
        };

        document.addEventListener("mousedown", handleMouseDown);
        return () => document.removeEventListener("mousedown", handleMouseDown);
    }, [close, open]);

    React.useEffect(() => {
        if (!open) return;

        const onWindowChange = () => computePosition();
        window.addEventListener("resize", onWindowChange);
        window.addEventListener("scroll", onWindowChange, true);

        return () => {
            window.removeEventListener("resize", onWindowChange);
            window.removeEventListener("scroll", onWindowChange, true);
        };
    }, [computePosition, open]);

    React.useEffect(() => {
        // Keep highlight within bounds when filtering.
        setHighlightedIndex((idx) => {
            if (filteredOptions.length === 0) return 0;
            return Math.max(0, Math.min(idx, filteredOptions.length - 1));
        });
    }, [filteredOptions.length]);

    const handleOpen = React.useCallback(() => {
        if (blurTimerRef.current != null) {
            window.clearTimeout(blurTimerRef.current);
            blurTimerRef.current = null;
        }
        setOpen(true);
    }, []);

    const handleInputBlur = React.useCallback(() => {
        // Delay close so a portal click can register first.
        blurTimerRef.current = window.setTimeout(() => {
            close();
        }, 150);
    }, [close]);

    const handleInputKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (!open) {
                if (e.key === "ArrowDown" || e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleOpen();
                }
                if (e.key === "Tab") {
                    e.preventDefault();
                    e.stopPropagation();
                    onNavigate(e.shiftKey ? "shiftTab" : "tab");
                }
                if (e.key === "Escape") {
                    e.stopPropagation();
                    onNavigate("escape");
                }
                return;
            }

            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                close();
                onNavigate("escape");
                return;
            }

            if (e.key === "Tab") {
                e.preventDefault();
                e.stopPropagation();
                close();
                onNavigate(e.shiftKey ? "shiftTab" : "tab");
                return;
            }

            if (e.key === "ArrowDown") {
                e.preventDefault();
                e.stopPropagation();
                setHighlightedIndex((i) => Math.min(filteredOptions.length - 1, i + 1));
                return;
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                e.stopPropagation();
                setHighlightedIndex((i) => Math.max(0, i - 1));
                return;
            }
            if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                const opt = filteredOptions[highlightedIndex];
                if (opt) commitOption(opt);
            }
        },
        [close, commitOption, filteredOptions, handleOpen, highlightedIndex, onNavigate, open]
    );

    const handleSearchKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                close();
                onNavigate("escape");
                return;
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                e.stopPropagation();
                setHighlightedIndex((i) => Math.min(filteredOptions.length - 1, i + 1));
                return;
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                e.stopPropagation();
                setHighlightedIndex((i) => Math.max(0, i - 1));
                return;
            }
            if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                const opt = filteredOptions[highlightedIndex];
                if (opt) commitOption(opt);
                return;
            }
            if (e.key === "Tab") {
                e.preventDefault();
                e.stopPropagation();
                close();
                onNavigate(e.shiftKey ? "shiftTab" : "tab");
            }
        },
        [close, commitOption, filteredOptions, highlightedIndex, onNavigate]
    );

    const label = selected?.label ?? "";

    const portalTarget = typeof document !== "undefined" ? document.body : null;
    const canRenderPortal = open && portalTarget && position;

    return (
        <div ref={cellRef} style={{ position: "relative", width: "100%", height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", width: "100%", height: "100%" }}>
                <input
                    ref={inputRef}
                    type="text"
                    readOnly
                    value={label}
                    onFocus={handleOpen}
                    onClick={handleOpen}
                    onBlur={handleInputBlur}
                    onKeyDown={handleInputKeyDown}
                    style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        outline: "none",
                        padding: "0 20px 0 4px",
                        font: "inherit",
                        background: "inherit",
                        cursor: "default"
                    }}
                />
                <span
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        right: 6,
                        pointerEvents: "none",
                        fontSize: 12,
                        color: "#444"
                    }}
                >
                    ▼
                </span>
            </div>

            {canRenderPortal
                ? ReactDOM.createPortal(
                    <ul
                        ref={portalRef}
                        style={{
                            position: "absolute",
                            top: position.top,
                            left: position.left,
                            minWidth: position.width,
                            maxHeight: 240,
                            overflowY: "auto",
                            margin: 0,
                            padding: 6,
                            listStyle: "none",
                            background: "#ffffff",
                            borderRadius: 4,
                            boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
                            zIndex: 9999
                        }}
                    >
                        <li style={{ marginBottom: 6 }}>
                            <input
                                ref={searchRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    border: "1px solid #d0d0d0",
                                    borderRadius: 4,
                                    padding: "6px 8px",
                                    outline: "none",
                                    font: "inherit"
                                }}
                                placeholder="Search..."
                            />
                        </li>

                        {filteredOptions.length === 0 ? (
                            <li style={{ padding: "8px 8px", color: "#666", fontSize: 13 }}>No results</li>
                        ) : (
                            filteredOptions.map((opt, idx) => {
                                const isHighlighted = idx === highlightedIndex;
                                const isSelected = selected ? coerceToString(selected.value) === coerceToString(opt.value) : false;

                                return (
                                    <li
                                        key={coerceToString(opt.value)}
                                        onMouseEnter={() => setHighlightedIndex(idx)}
                                        onMouseDown={(e) => {
                                            // Prevent focus loss before click handler runs.
                                            e.preventDefault();
                                        }}
                                        onClick={() => commitOption(opt)}
                                        style={{
                                            padding: "6px 8px",
                                            borderRadius: 4,
                                            cursor: "pointer",
                                            background: isHighlighted ? "#e6f2fb" : "transparent",
                                            fontSize: 13,
                                            fontWeight: isSelected ? 600 : 400
                                        }}
                                    >
                                        {opt.label}
                                    </li>
                                );
                            })
                        )}
                    </ul>,
                    portalTarget
                )
                : null}
        </div>
    );
}

