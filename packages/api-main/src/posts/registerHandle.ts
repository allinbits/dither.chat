import type { Posts } from '@atomone/dither-api-types';

import type { DbClient } from '../../drizzle/db';

import { eq } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { AccountTable } from '../../drizzle/schema';
import { notify } from '../shared/notify';
import { lower } from '../utility';
import { checkAccountHandleIsValid } from '../utility/handle';

export async function RegisterHandle(body: Posts.RegisterHandleBody) {
  try {
    checkAccountHandleIsValid(body.handle);
  } catch (e) {
    return { status: 400, error: (e as Error).message };
  }

  const db = getDatabase();
  const address = body.address.toLowerCase();

  try {
    if (await doesHandleExists(db, body.handle)) {
      await notify({
        hash: body.hash,
        type: 'registerHandle',
        actor: address,
        owner: address,
        timestamp: new Date(body.timestamp),
        subcontext: 'Handle is already taken',
      });

      return { status: 400, error: 'handle is already registered' };
    }

    await db
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

    return { status: 200 };
  } catch (err) {
    console.error(err);
    return { status: 400, error: 'failed to register handle' };
  }
}

async function doesHandleExists(db: DbClient, name: string): Promise<boolean> {
  const count = await db.$count(AccountTable, eq(lower(AccountTable.handle), name.toLowerCase()));
  return count !== 0;
}
