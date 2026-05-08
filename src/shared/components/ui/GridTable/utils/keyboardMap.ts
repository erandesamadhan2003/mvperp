import type * as React from "react";

import type { NavigationDirection } from "../types/navigation.types";

/**
 * Maps a keyboard event to a GridTable navigation direction.
 *
 * @param e A React keyboard event or a native DOM KeyboardEvent.
 * @returns The mapped `NavigationDirection`, or null when the key is not a navigation key.
 */
export function getNavigationDirection(
    e: React.KeyboardEvent | KeyboardEvent
): NavigationDirection | null {
    switch (e.key) {
        case "Tab":
            return ("shiftKey" in e && e.shiftKey) ? "shiftTab" : "tab";
        case "ArrowRight":
            return "right";
        case "ArrowLeft":
            return "left";
        case "ArrowDown":
            return "down";
        case "ArrowUp":
            return "up";
        case "Enter":
            return "enter";
        case "Escape":
            return "escape";
        default:
            return null;
    }
}

/**
 * Determines whether the keypress should call `preventDefault()` in a grid context.
 *
 * This is typically used to:
 * - Prevent Tab from moving focus outside the grid.
 * - Prevent arrow keys from scrolling the page.
 * - Prevent Enter from triggering form submissions while navigating/editing.
 *
 * @param e A React keyboard event or a native DOM KeyboardEvent.
 * @returns True when the key should be prevented, otherwise false.
 */
export function shouldPreventDefault(e: React.KeyboardEvent | KeyboardEvent): boolean {
    return (
        e.key === "Tab" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "Enter"
    );
}

/**
 * Determines whether a keypress should start cell editing.
 *
 * Rules:
 * - Returns true for printable characters (`e.key.length === 1`) and for `F2`.
 * - Returns false for modifier keys and navigation/command keys.
 *
 * @param e A React keyboard event.
 * @returns True when the key should enter edit mode, otherwise false.
 */
export function isEditableKey(e: React.KeyboardEvent): boolean {
    if (e.key === "F2") return true;
    if (e.key.length === 1) return true;

    // Explicitly exclude common non-edit keys.
    if (
        e.key === "Shift" ||
        e.key === "Control" ||
        e.key === "Alt" ||
        e.key === "Meta" ||
        e.key === "CapsLock" ||
        e.key === "Tab" ||
        e.key === "Enter" ||
        e.key === "Escape" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowUp"
    ) {
        return false;
    }

    return false;
}
