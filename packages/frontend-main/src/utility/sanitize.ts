import type { Static, TSchema } from '@sinclair/typebox';

import { Value } from '@sinclair/typebox/value';

export interface RawRow {
  timestamp?: unknown;
  reposts?: unknown;
  [key: string]: unknown;
};

// This function preprocesses a row to ensure that the timestamp is a Date object
// and that optional fields have default values.
function preprocessRow<T extends RawRow>(row: T): T {
  const processed = { ...row };

  if (typeof processed.timestamp === 'string') {
    processed.timestamp = new Date(processed.timestamp);
  }

  // Default reposts to 0 for older posts that don't have this field
  if (processed.reposts === undefined) {
    processed.reposts = 0;
  }

  return processed;
}

// This function checks an array of fetched rows against a given Typebox schema and returns the validated rows.
export function checkRowsSchema<T extends TSchema>(
  schema: T,
  rows: RawRow[],
): Static<T>[] {
  return rows
    .map((rawRow, i) => {
      const row = preprocessRow(rawRow);
      if (!Value.Check(schema, row)) {
        console.warn(`Invalid row at index ${i}`, [...Value.Errors(schema, row)]);
        return null;
      }
      const validatedRow = row as Static<T>;
      return validatedRow;
    })
    .filter((row): row is Static<T> => !!row);
}
