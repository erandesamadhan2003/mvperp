/**
 * Allowed keyboard/navigation actions emitted by the GridTable.
 */
export type NavigationDirection =
    | 'up'
    | 'down'
    | 'left'
    | 'right'
    | 'tab'
    | 'shiftTab'
    | 'enter'
    | 'escape';

/**
 * Options that control how the GridTable interprets keyboard navigation.
 */
export interface NavigationOptions {
    /**
     * When true, Tab at the last column wraps to column 0 of the next row.
     */
    wrapRows?: boolean;

    /**
     * When true, Tab/Arrow navigation skips cells whose column is read-only.
     */
    skipReadOnly?: boolean;

    /**
     * When true, Enter commits the edit and moves down one row.
     */
    enterMovesDown?: boolean;
}
