import type { Posts } from '@atomone/dither-api-types';

import { and, eq, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { HandleTable, HandleTransferTable } from '../../drizzle/schema';
import { lower } from '../utility';

const statement = getDatabase()
  .insert(HandleTransferTable)
  .values({
    hash: sql.placeholder('hash'),
    name: sql.placeholder('name'),
    from_address: sql.placeholder('from_address'),
    to_address: sql.placeholder('to_address'),
    timestamp: sql.placeholder('timestamp'),
  })
  .onConflictDoNothing()
  .prepare('stmnt_handle_transfer_insert');

export async function Transfer(body: Posts.TransferBody) {
  try {
    if (!await isHandleOwner(body.handle, body.from_address)) {
      return { status: 400, error: 'handle not found or not registered for address' };
    }

    await statement.execute({
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

async function isHandleOwner(handle: string, address: string): Promise<boolean> {
  const count = await getDatabase().$count(HandleTable, and(
    eq(lower(HandleTable.name), handle.toLowerCase()),
    eq(HandleTable.address, address.toLowerCase()),
  ));
  return count !== 0;
}
