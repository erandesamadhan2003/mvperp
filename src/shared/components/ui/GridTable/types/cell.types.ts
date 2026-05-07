export interface CellCoord {
    rowIndex: number;
    colIndex: number;
}

export interface CellState {
    active: CellCoord | null;
    editing: CellCoord | null;
}

export type CellValue = string | number | boolean | null | Date;

export interface CellChangeEvent {
    rowIndex: number;
    colIndex: number;
    key: string;   // column.key
    oldValue: CellValue;
    newValue: CellValue;
}