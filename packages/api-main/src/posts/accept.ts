import type { Posts } from '@atomone/dither-api-types';

import type { DbClient } from '../../drizzle/db';

import { and, eq } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { HandleTable, HandleTransferTable } from '../../drizzle/schema';
import { lower } from '../utility';

export async function Accept(body: Posts.AcceptBody) {
  const db = getDatabase();
  try {
    if (!await doesTransferToAddressExists(db, body.handle, body.to_address)) {
      return { status: 400, error: 'handle not found or not transferred to address' };
    }

    await db
      .update(HandleTable)
      .set({ address: body.to_address.toLowerCase() })
      .where(eq(lower(HandleTable.name), body.handle.toLowerCase()));

    return { status: 200 };
  } catch (err) {
    console.error(err);
    return { status: 400, error: 'failed to transfer handle' };
  }
}

async function doesTransferToAddressExists(db: DbClient, handle: string, address: string): Promise<boolean> {
  const count = await db.$count(HandleTransferTable, and(
    eq(lower(HandleTransferTable.name), handle.toLowerCase()),
    eq(HandleTransferTable.to_address, address.toLowerCase()),
  ));
  return count !== 0;
}
