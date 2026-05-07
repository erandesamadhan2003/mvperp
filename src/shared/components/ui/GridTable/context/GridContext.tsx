import { createContext } from "react";
import { GridColumn } from "../types/column.types";
import { CellChangeEvent, CellCoord, CellState } from "../types/cell.types";
import { PaginationState } from "../types/pagination.types";
import { NavigationDirection } from "../types/navigation.types";

export interface GridContextValue<TRow = Record<string, unknown>> {
    columns: GridColumn<TRow> [];
    pageData: TRow;
    cellState: CellState;
    pagination: PaginationState;
    setActive: (coord: CellCoord | null) => void;
    setEditing: (coord: CellCoord | null) => void;
    commitChange: (event: CellChangeEvent) => void;
    goTo: (direction: NavigationDirection) => void;
}


export const GridContext = createContext<GridContextValue | null>(null);