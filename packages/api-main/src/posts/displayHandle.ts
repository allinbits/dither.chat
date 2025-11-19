import type { Posts } from '@atomone/dither-api-types';

import { count, eq, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { HandleTable } from '../../drizzle/schema';
import { lower } from '../utility';
import { MAX_DISPLAY_LENGTH } from './registerHandle';

const handleAddressExistsStmt = getDatabase()
  .select({ count: count() })
  .from(HandleTable)
  .where(eq(lower(HandleTable.address), sql.placeholder('address')))
  .prepare('stmt_handle_address_exists');

export async function DisplayHandle(body: Posts.DisplayHandleBody) {
  const display = (body.display || '').trim();
  if (display.length > MAX_DISPLAY_LENGTH) {
    return { status: 400, error: `maximum display length is ${MAX_DISPLAY_LENGTH} characters long` };
  }

  const db = getDatabase();
  try {
    const address = body.from.toLowerCase();
    if (!await hasHandle(address)) {
      return { status: 400, error: 'account requires a handle to set a display text' };
    }

    await db
      .update(HandleTable)
      .set({ display })
      .where(eq(HandleTable.address, address));

    return { status: 200 };
  } catch (err) {
    console.error(err);
    return { status: 400, error: 'failed to update display handle' };
  }
}

async function hasHandle(address: string): Promise<boolean> {
  const [result] = await handleAddressExistsStmt.execute({ address });
  return (result?.count ?? 0) !== 0;
}
