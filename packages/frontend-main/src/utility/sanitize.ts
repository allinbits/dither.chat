import { Value } from '@sinclair/typebox/value';

export interface RawRow {
  timestamp?: unknown;
  reposts?: unknown;
  reposted_by?: unknown;
  reposted_at?: unknown;
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

  // Handle repost fields (convert reposted_at string to Date)
  if (typeof processed.reposted_at === 'string') {
    processed.reposted_at = new Date(processed.reposted_at);
  }

  return processed;
}

// This function checks an array of fetched rows against a given Typebox schema and returns the validated rows.
export function checkRowsSchema<T>(
  schema: unknown,
  rows: RawRow[],
): T[] {
  return rows
    .map((rawRow, i) => {
      const row = preprocessRow(rawRow);
      if (!Value.Check(schema as any, row)) {
        console.warn(`Invalid row at index ${i}`, [...Value.Errors(schema as any, row)]);
        return null;
      }
      return row as T;
    })
    .filter((row): row is T => !!row);
}
