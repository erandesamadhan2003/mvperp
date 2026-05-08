/**
 * Returns the slice of rows for a given page.
 *
 * @typeParam TRow - Row type.
 * @param data Full dataset.
 * @param page Current page number (typically 1-based).
 * @param pageSize Rows per page.
 * @returns Page slice of `data`.
 */
export function getPageSlice<TRow>(data: TRow[], page: number, pageSize: number): TRow[] {
    return data.slice((page - 1) * pageSize, page * pageSize);
}

/**
 * Produces an updated copy of the dataset where exactly one row is replaced.
 *
 * Uses an immutable update pattern (new array + shallow-cloned row).
 *
 * @typeParam TRow - Row shape.
 * @param data Full dataset.
 * @param absoluteIndex Absolute row index in the full dataset.
 * @param key Column key to update.
 * @param value New value.
 * @returns A new array with the row at `absoluteIndex` replaced.
 * @throws RangeError When `absoluteIndex` is out of bounds.
 */
export function updateRowImmutable<TRow extends Record<string, unknown>>(
    data: TRow[],
    absoluteIndex: number,
    key: string,
    value: unknown
): TRow[] {
    if (absoluteIndex < 0 || absoluteIndex >= data.length) {
        throw new RangeError(`absoluteIndex out of bounds: ${absoluteIndex}`);
    }

    return [
        ...data.slice(0, absoluteIndex),
        { ...data[absoluteIndex], [key]: value } as TRow,
        ...data.slice(absoluteIndex + 1)
    ];
}

/**
 * Converts a page-relative row index to an absolute index in the full dataset.
 *
 * @param pageRowIndex Row index within the current page (0-based).
 * @param page Current page number (typically 1-based).
 * @param pageSize Rows per page.
 * @returns Absolute row index.
 */
export function getAbsoluteRowIndex(pageRowIndex: number, page: number, pageSize: number): number {
    return (page - 1) * pageSize + pageRowIndex;
}

/**
 * Safely reads a value from a row by key.
 *
 * This helper never throws; it returns null when the key is missing or the
 * value is nullish.
 *
 * @typeParam TRow - Row shape.
 * @param row Row object.
 * @param key Key to read.
 * @returns The value at `row[key]`, or null when missing.
 */
export function getCellValue<TRow extends Record<string, unknown>>(row: TRow, key: string): unknown {
    try {
        return (row as Record<string, unknown>)[key] ?? null;
    } catch {
        return null;
    }
}
