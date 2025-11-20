import type { Posts } from '@atomone/dither-api-types';

import { and, count, eq, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { AccountTable, HandleTransferTable } from '../../drizzle/schema';
import { lower } from '../utility';

const handleOwnerExistsStmt = getDatabase()
  .select({ count: count() })
  .from(AccountTable)
  .where(
    and(
      eq(AccountTable.address, sql.placeholder('address')),
      eq(lower(AccountTable.handle), sql.placeholder('handle')),
    ),
  )
  .prepare('stmt_handle_owner_exists');

export async function TransferHandle(body: Posts.TransferHandleBody) {
  const fromAddress = body.from_address.toLowerCase();

  try {
    if (!await isHandleOwner(fromAddress, body.handle)) {
      return { status: 400, error: 'handle not found or not registered to sender address' };
    }

    await getDatabase()
      .insert(HandleTransferTable)
      .values({
        hash: body.hash.toLowerCase(),
        name: body.handle,
        from_address: fromAddress,
        to_address: body.to_address.toLowerCase(),
        timestamp: new Date(body.timestamp),
      });

    return { status: 200 };
  } catch (err) {
    console.error(err);
    return { status: 400, error: 'failed to transfer handle' };
  }
}

async function isHandleOwner(address: string, handle: string): Promise<boolean> {
  const [result] = await handleOwnerExistsStmt.execute({
    address,
    handle: handle.toLowerCase(),
  });
  return (result?.count ?? 0) !== 0;
}
