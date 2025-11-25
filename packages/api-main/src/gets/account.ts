import type { Gets } from '@atomone/dither-api-types';

import { eq, or, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { AccountTable } from '../../drizzle/schema';

const statement = getDatabase()
  .select()
  .from(AccountTable)
  .where(
    or(
      eq(AccountTable.handle, sql.placeholder('handle')),
      eq(AccountTable.address, sql.placeholder('address')),
    ),
  )
  .prepare('stmnt_get_handle');

export async function Account(query: Gets.AccountQuery) {
  const { address, handle } = query;
  if (!address && !handle) {
    return { status: 400, error: 'handle or address is required' };
  }

  try {
    const [account] = await statement.execute({ address, handle });
    if (!account) {
      return { status: 404, rows: [] };
    }

    return { status: 200, rows: [account] };
  } catch (error) {
    console.error(error);
    return { error: 'failed to read data from database' };
  }
}
