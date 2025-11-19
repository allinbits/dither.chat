import type { Posts } from '@atomone/dither-api-types';

import type { DbClient } from '../../drizzle/db';

import { eq } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { HandleTable } from '../../drizzle/schema';
import { notify } from '../shared/notify';
import { lower } from '../utility';

const minHandleLength = 5;
const maxHandleLength = 32;

export const maxDisplayLength = 128;
export const tgHandleRegex = /^[a-z]{3}\w*$/i;

export async function RegisterHandle(body: Posts.RegisterHandleBody) {
  if (!tgHandleRegex.test(body.handle)) {
    return {
      status: 400,
      error: 'handle must start with three letters and can only include letters, numbers and underscores',
    };
  }

  if (body.handle.length < minHandleLength || body.handle.length > maxHandleLength) {
    return { status: 400, error: `handle must have between ${minHandleLength} and ${maxHandleLength} characters long` };
  }

  const display = (body.display || '').trim();
  if (display.length > maxDisplayLength) {
    return { status: 400, error: `maximum display length is ${maxDisplayLength} characters long` };
  }

  const db = getDatabase();
  try {
    const timestamp = new Date(body.timestamp);
    if (await doesHandleExists(db, body.handle)) {
      await notify({
        hash: body.hash,
        type: 'register',
        actor: body.from,
        owner: body.from,
        timestamp,
        subcontext: 'Handle is already taken',
      });

      // Succeed to stop reader from keep trying to register
      return { status: 200, error: 'handle is already registered' };
    }

    const address = body.from.toLowerCase();

    await db.transaction(async (tx) => {
      // Remove current handle if one is registered to address
      await tx
        .delete(HandleTable)
        .where(eq(HandleTable.address, address));

      // Register a new handle for the address
      await tx
        .insert(HandleTable)
        .values({
          name: body.handle,
          hash: body.hash.toLowerCase(),
          address: body.from.toLowerCase(),
          display: display || null,
          timestamp,
        });
    });

    return { status: 200 };
  } catch (err) {
    console.error(err);
    return { status: 400, error: 'failed to register handle' };
  }
}

async function doesHandleExists(db: DbClient, name: string): Promise<boolean> {
  const count = await db.$count(HandleTable, eq(lower(HandleTable.name), name.toLowerCase()));
  return count !== 0;
}
