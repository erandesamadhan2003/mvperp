export type NavigationDirection = 'up' | 'down' | 'left' | 'right' | 'tab' | 'shiftTab';

export interface NavigationOptions {
    wrapRows?: boolean;
    skipReadOnly?: boolean;
}