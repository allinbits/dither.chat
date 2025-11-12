import type { Posts } from '@atomone/dither-api-types';

import { eq, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { HandleTable } from '../../drizzle/schema';
import { lower } from '../utility';

const statement = getDatabase()
  .insert(HandleTable)
  .values({
    name: sql.placeholder('name'),
    address: sql.placeholder('address'),
    hash: sql.placeholder('hash'),
    timestamp: sql.placeholder('timestamp'),
  })
  .onConflictDoNothing()
  .prepare('stmnt_handle_insert');

export const tgHandleRegex = /^[a-z]{3}\w*$/i;

export async function Register(body: Posts.RegisterBody) {
  // TODO: Define how many names a single account can register

  if (!tgHandleRegex.test(body.handle)) {
    return {
      status: 400,
      error: 'handle must start with three letters and can only include letters, numbers and underscores',
    };
  }

  if (body.handle.length < 5 || body.handle.length > 32) {
    return { status: 400, error: 'handle must have between 5 and 32 characters long' };
  }

  try {
    if (await doesHandleExists(body.handle)) {
      return { status: 400, error: 'handle is already registered' };
    }

    await statement.execute({
      hash: body.hash.toLowerCase(),
      address: body.from.toLowerCase(),
      name: body.handle,
      timestamp: new Date(body.timestamp),
    });

    return { status: 200 };
  } catch (err) {
    console.error(err);
    return { status: 400, error: 'failed to register handle' };
  }
}

async function doesHandleExists(name: string): Promise<boolean> {
  const count = await getDatabase().$count(HandleTable, eq(lower(HandleTable.name), name.toLowerCase()));
  return count !== 0;
}
