import type { Posts } from '@atomone/dither-api-types';

import type { DbClient } from '../../drizzle/db';

import { eq } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { AccountTable } from '../../drizzle/schema';
import { notify } from '../shared/notify';
import { lower } from '../utility';

const MIN_HANDLE_LENGTH = 5;
const MAX_HANDLE_LENGTH = 32;
const HANDLE_REGEX = /^[a-z]{3}\w*$/i;

export async function RegisterHandle(body: Posts.RegisterHandleBody) {
  if (!HANDLE_REGEX.test(body.handle)) {
    return {
      status: 400,
      error: 'handle must start with three letters and can only include letters, numbers and underscores',
    };
  }

  if (body.handle.length < MIN_HANDLE_LENGTH || body.handle.length > MAX_HANDLE_LENGTH) {
    return { status: 400, error: `handle must have between ${MIN_HANDLE_LENGTH} and ${MAX_HANDLE_LENGTH} characters long` };
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
