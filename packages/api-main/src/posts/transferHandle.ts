import type { Posts } from '@atomone/dither-api-types';

import type { DbClient } from '../../drizzle/db';

import { and, eq } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { AccountTable, HandleTransferTable } from '../../drizzle/schema';
import { lower } from '../utility';

export async function TransferHandle(body: Posts.TransferHandleBody) {
  const db = getDatabase();
  try {
    if (!await isHandleOwner(db, body.handle, body.from_address)) {
      return { status: 400, error: 'handle not found or not registered for address' };
    }

    const fromAddress = body.from_address.toLowerCase();

    await db.transaction(async (tx) => {
      // If it exists delete previous transfer for the same handle
      await tx
        .delete(HandleTransferTable)
        .where(
          and(
            eq(lower(HandleTransferTable.name), body.handle.toLowerCase()),
            eq(HandleTransferTable.from_address, fromAddress),
          ),
        );

      // Add a handle transfer to a new address
      await tx
        .insert(HandleTransferTable)
        .values({
          hash: body.hash.toLowerCase(),
          name: body.handle,
          from_address: fromAddress,
          to_address: body.to_address.toLowerCase(),
          timestamp: new Date(body.timestamp),
        });
    });

    return { status: 200 };
  } catch (err) {
    console.error(err);
    return { status: 400, error: 'failed to transfer handle' };
  }
}

async function isHandleOwner(db: DbClient, handle: string, address: string): Promise<boolean> {
  const count = await db.$count(AccountTable, and(
    eq(lower(AccountTable.handle), handle.toLowerCase()),
    eq(AccountTable.address, address.toLowerCase()),
  ));
  return count !== 0;
}
