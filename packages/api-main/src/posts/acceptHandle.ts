import type { Posts } from '@atomone/dither-api-types';

import { and, count, eq, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { AccountTable, HandleTransferTable } from '../../drizzle/schema';
import { lower } from '../utility';

const transferToAddressExistsStmt = getDatabase()
  .select({ count: count() })
  .from(HandleTransferTable)
  .where(
    and(
      eq(lower(HandleTransferTable.name), sql.placeholder('handle')),
      eq(HandleTransferTable.to_address, sql.placeholder('address')),
      eq(HandleTransferTable.accepted, false),
    ),
  )
  .prepare('stmt_transfer_to_adress_exists');

export async function AcceptHandle(body: Posts.AcceptHandleBody) {
  const address = body.address.toLowerCase();
  const handle = body.handle.toLowerCase();

  try {
    if (!await doesTransferToAddressExists(handle, address)) {
      return { status: 400, error: 'handle not found or not transferred to address' };
    }

    await getDatabase().transaction(async (tx) => {
      // Remove handle from current owner
      await tx
        .update(AccountTable)
        .set({ handle: null })
        .where(eq(lower(AccountTable.handle), handle));

      // Assign handle to new owner
      await tx
        .insert(AccountTable)
        .values({
          address,
          handle: body.handle,
        })
        .onConflictDoUpdate({
          target: AccountTable.address,
          set: {
            handle: body.handle,
          },
        });

      // Mark transfer(s) as finished to disallow potential future usage of this transfer
      await tx
        .update(HandleTransferTable)
        .set({ accepted: true })
        .where(
          and(
            eq(lower(HandleTransferTable.name), handle),
            eq(HandleTransferTable.to_address, address),
            eq(HandleTransferTable.accepted, false),
          ),
        );
    });

    return { status: 200 };
  } catch (err) {
    console.error(err);
    return { status: 400, error: 'failed to transfer handle' };
  }
}

async function doesTransferToAddressExists(handle: string, address: string): Promise<boolean> {
  const [result] = await transferToAddressExistsStmt.execute({ address, handle });
  return (result?.count ?? 0) !== 0;
}
