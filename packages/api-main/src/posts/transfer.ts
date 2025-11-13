import type { Posts } from '@atomone/dither-api-types';

import type { DbClient } from '../../drizzle/db';

import { and, eq } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { HandleTable, HandleTransferTable } from '../../drizzle/schema';
import { lower } from '../utility';

export async function Transfer(body: Posts.TransferBody) {
  const db = getDatabase();
  try {
    if (!await isHandleOwner(db, body.handle, body.from_address)) {
      return { status: 400, error: 'handle not found or not registered for address' };
    }

    await db.insert(HandleTransferTable).values({
      hash: body.hash.toLowerCase(),
      from_address: body.from_address.toLowerCase(),
      to_address: body.to_address.toLowerCase(),
      name: body.handle,
      timestamp: new Date(body.timestamp),
    });

    return { status: 200 };
  } catch (err) {
    console.error(err);
    return { status: 400, error: 'failed to transfer handle' };
  }
}

async function isHandleOwner(db: DbClient, handle: string, address: string): Promise<boolean> {
  const count = await db.$count(HandleTable, and(
    eq(lower(HandleTable.name), handle.toLowerCase()),
    eq(HandleTable.address, address.toLowerCase()),
  ));
  return count !== 0;
}
