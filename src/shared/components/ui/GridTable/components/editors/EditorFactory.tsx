import type { EditorBaseProps } from "../../types/cell.types";

import { CalendarEditor } from "./CalendarEditor";
import { DialogEditor } from "./DialogEditor";
import { DropdownEditor } from "./DropdownEditor";
import { NumberEditor } from "./NumberEditor";
import { SelectEditor } from "./SelectEditor";
import { TextEditor } from "./TextEditor";

/**
 * EditorFactory — a thin dispatcher that chooses the correct cell editor.
 *
 * Factory pattern:
 * - Keeps `GridCell` simple by isolating editor selection in one place.
 * - To add a new editor type, create a new editor component and extend the
 *   `switch (column.type)` below.
 */
export function EditorFactory(props: EditorBaseProps) {
    if (props.column.readOnly) return null;

    switch (props.column.type) {
        case "number":
            return <NumberEditor {...props} />;
        case "select":
            return <SelectEditor {...props} />;
        case "dropdown":
            return <DropdownEditor {...props} />;
        case "calendar":
            return <CalendarEditor {...props} />;
        case "dialog":
            return <DialogEditor {...props} />;
        default:
            return <TextEditor {...props} />;
    }
}

