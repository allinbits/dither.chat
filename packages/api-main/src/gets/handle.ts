import type { Gets } from '@atomone/dither-api-types';

import { eq, or, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { AccountTable } from '../../drizzle/schema';

const statement = getDatabase()
  .select({
    handle: AccountTable.handle,
    address: AccountTable.address,
    display: AccountTable.display,
  })
  .from(AccountTable)
  .where(
    or(
      eq(AccountTable.handle, sql.placeholder('handle')),
      eq(AccountTable.address, sql.placeholder('address')),
    ),
  )
  .orderBy(AccountTable.handle)
  .limit(1)
  .prepare('stmnt_get_handle');

export async function Handle(query: Gets.HandleQuery) {
  const { address, name } = query;
  if (!address && !name) {
    return { status: 400, error: 'handle name or address is required' };
  }

  try {
    const [handle] = await statement.execute({ address, handle: name });
    if (!handle) {
      return { status: 404, rows: [] };
    }

    return { status: 200, rows: [handle] };
  } catch (error) {
    console.error(error);
    return { error: 'failed to read data from database' };
  }
}
