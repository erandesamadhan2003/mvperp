import * as React from "react";

import type { GridContextValue } from "./GridContext";

import { GridContext } from "./GridContext";

/**
 * Consumes the GridTable context safely.
 *
 * Use this hook inside components that are rendered under a `GridProvider`.
 * If used outside the provider tree, it throws a descriptive error to help
 * diagnose setup issues.
 */
export function useGridContext<TRow extends Record<string, unknown> = Record<string, unknown>>() {
    const contextValue = React.useContext(GridContext);

    if (contextValue === null) {
        throw new Error(
            "useGridContext must be used inside <GridProvider>.\n" +
            "Wrap your GridTable with GridProvider or use the GridTable component directly."
        );
    }

    return contextValue as GridContextValue<TRow>;
}
