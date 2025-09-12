import type { TSchema } from '@sinclair/typebox';
import type { Static } from '@sinclair/typebox';
import type { ValueError } from '@sinclair/typebox/compiler';

import { TypeCompiler } from '@sinclair/typebox/compiler';
import DOMPurify from 'dompurify';

export interface RawRow {
    timestamp?: unknown;
    [key: string]: unknown;
};

// This function preprocesses a row to ensure that the timestamp is a Date object.
function preprocessRow<T extends RawRow>(row: T): T {
    if (typeof row.timestamp === 'string') {
        return {
            ...row,
            timestamp: new Date(row.timestamp),
        };
    }
    return row;
}

// This function checks an array of fetched rows against a given Typebox schema and returns the validated rows.
export function checkRowsSchema<T extends TSchema>(
    schema: T,
    rows: RawRow[],
): Static<T>[] {
    const typeChecker = TypeCompiler.Compile(schema);
    return rows
        .map((rawRow, i) => {
            const row = preprocessRow(rawRow);
            if (!typeChecker.Check(row)) {
                console.warn(`Invalid row at index ${i}`, [...typeChecker.Errors(row)] as ValueError[]);
                return null;
            }
            const validatedRow = row as Static<T>;
            return validatedRow;
        })
        .filter((row): row is Static<T> => !!row);
}
