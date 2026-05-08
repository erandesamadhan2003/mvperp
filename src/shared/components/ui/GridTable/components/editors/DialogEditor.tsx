import * as React from "react";
import * as ReactDOM from "react-dom";

import type { EditorBaseProps } from "../../types/cell.types";

function getFocusableElements(root: HTMLElement): HTMLElement[] {
    const selectors = [
        "a[href]",
        "button:not([disabled])",
        "textarea:not([disabled])",
        "input:not([disabled])",
        "select:not([disabled])",
        "[tabindex]:not([tabindex='-1'])"
    ].join(",");

    const nodes = Array.from(root.querySelectorAll<HTMLElement>(selectors));
    return nodes.filter((el) => {
        const style = window.getComputedStyle(el);
        return style.visibility !== "hidden" && style.display !== "none";
    });
}

/**
 * DialogEditor — modal editor for GridTable dialog-type columns.
 *
 * Use dialog editors when a cell's value requires a larger, richer UI than an
 * inline input can provide. This component renders into `document.body` via
 * `ReactDOM.createPortal` and includes a basic focus trap.
 */
export function DialogEditor(props: EditorBaseProps) {
    const { column, value, rowIndex, colIndex, onCommit, onNavigate } = props;

    const Dialog = column.dialogComponent;

    const [isOpen, setIsOpen] = React.useState<boolean>(true);
    const [localValue, setLocalValue] = React.useState<unknown>(() => value);

    const overlayRef = React.useRef<HTMLDivElement | null>(null);
    const modalRef = React.useRef<HTMLDivElement | null>(null);
    const previouslyFocusedRef = React.useRef<HTMLElement | null>(null);

    const closeDiscard = React.useCallback(() => {
        setIsOpen(false);
        onNavigate("escape");
    }, [onNavigate]);

    const commitValue = React.useCallback(
        (newValue: unknown) => {
            setLocalValue(newValue);
            onCommit({
                rowIndex,
                colIndex,
                key: column.key,
                oldValue: value,
                newValue: newValue as any
            });
            setIsOpen(false);
        },
        [colIndex, column.key, onCommit, rowIndex, value]
    );

    React.useEffect(() => {
        if (!isOpen) return;
        if (typeof document === "undefined") return;

        previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

        // Focus the first focusable element inside the modal.
        const id = window.setTimeout(() => {
            const modalEl = modalRef.current;
            if (!modalEl) return;
            const focusables = getFocusableElements(modalEl);
            (focusables[0] ?? modalEl).focus();
        }, 0);

        return () => window.clearTimeout(id);
    }, [isOpen]);

    React.useEffect(() => {
        if (isOpen) return;
        previouslyFocusedRef.current?.focus();
    }, [isOpen]);

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                closeDiscard();
                return;
            }

            if (e.key !== "Tab") return;
            const modalEl = modalRef.current;
            if (!modalEl) return;

            const focusables = getFocusableElements(modalEl);
            if (focusables.length === 0) {
                e.preventDefault();
                modalEl.focus();
                return;
            }

            const current = document.activeElement as HTMLElement | null;
            const currentIndex = current ? focusables.indexOf(current) : -1;

            e.preventDefault();

            if (e.shiftKey) {
                const nextIndex = currentIndex <= 0 ? focusables.length - 1 : currentIndex - 1;
                focusables[nextIndex]?.focus();
            } else {
                const nextIndex = currentIndex === -1 || currentIndex >= focusables.length - 1 ? 0 : currentIndex + 1;
                focusables[nextIndex]?.focus();
            }
        },
        [closeDiscard]
    );

    const portalTarget = typeof document !== "undefined" ? document.body : null;
    if (!portalTarget || !isOpen || !Dialog) {
        return null;
    }

    return ReactDOM.createPortal(
        <div
            ref={overlayRef}
            role="presentation"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) closeDiscard();
            }}
            onKeyDown={handleKeyDown}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                zIndex: 10000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16
            }}
        >
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
                style={{
                    background: "#ffffff",
                    borderRadius: 8,
                    padding: 24,
                    maxWidth: 600,
                    width: "100%",
                    maxHeight: "80vh",
                    overflowY: "auto",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.25)"
                }}
            >
                <Dialog
                    value={localValue}
                    onCommit={(newValue: unknown) => {
                        commitValue(newValue);
                    }}
                    onClose={() => {
                        closeDiscard();
                    }}
                />
            </div>
        </div>,
        portalTarget
    );
}

