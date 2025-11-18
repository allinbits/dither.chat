import type { Gets } from '@atomone/dither-api-types';

import { eq, or, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { HandleTable } from '../../drizzle/schema';

const statement = getDatabase()
  .select({
    name: HandleTable.name,
    address: HandleTable.address,
    display: HandleTable.display,
  })
  .from(HandleTable)
  .where(
    or(
      eq(HandleTable.name, sql.placeholder('name')),
      eq(HandleTable.address, sql.placeholder('address')),
    ),
  )
  .orderBy(HandleTable.name)
  .limit(1)
  .prepare('stmnt_get_handle');

export async function Handle(query: Gets.HandleQuery) {
  const { address, name } = query;
  if (!address && !name) {
    return { status: 400, error: 'handle name or address is required' };
  }

  try {
    const [handle] = await statement.execute({ address, name });
    if (!handle) {
      return { status: 404, rows: [] };
    }

    return { status: 200, rows: [handle] };
  } catch (error) {
    console.error(error);
    return { error: 'failed to read data from database' };
  }
}
