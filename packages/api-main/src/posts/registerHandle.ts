import type { Posts } from '@atomone/dither-api-types';

import type { DbClient } from '../../drizzle/db';

import { eq } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { AccountTable } from '../../drizzle/schema';
import { notify } from '../shared/notify';
import { lower } from '../utility';

export const MIN_HANDLE_LENGTH = 5;
export const MAX_HANDLE_LENGTH = 32;
export const MAX_DISPLAY_LENGTH = 128;
export const HANDLE_REGEX = /^[a-z]{3}\w*$/i;

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

  const display = (body.display || '').trim();
  if (display.length > MAX_DISPLAY_LENGTH) {
    return { status: 400, error: `maximum display length is ${MAX_DISPLAY_LENGTH} characters long` };
  }

  const db = getDatabase();
  try {
    if (await doesHandleExists(db, body.handle)) {
      await notify({
        hash: body.hash,
        type: 'register',
        actor: body.from,
        owner: body.from,
        timestamp: new Date(body.timestamp),
        subcontext: 'Handle is already taken',
      });

      // Succeed to stop reader from keep trying to register
      return { status: 200, error: 'handle is already registered' };
    }

    const address = body.from.toLowerCase();

    await db.transaction(async (tx) => {
      // Remove current handle if one is registered to address
      await tx
        .delete(AccountTable)
        .where(eq(AccountTable.address, address));

      // Register a new handle for the address
      await tx
        .insert(AccountTable)
        .values({
          handle: body.handle,
          address: body.from.toLowerCase(),
          display: display || null,
        });
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
