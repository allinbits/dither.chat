import type { Posts } from '@atomone/dither-api-types';

import { getDatabase } from '../../drizzle/db';
import { AccountTable } from '../../drizzle/schema';

const MAX_DISPLAY_LENGTH = 128;

export async function DisplayHandle(body: Posts.DisplayHandleBody) {
  const display = (body.display || '').trim();
  if (display.length > MAX_DISPLAY_LENGTH) {
    return { status: 400, error: `maximum display length is ${MAX_DISPLAY_LENGTH} characters long` };
  }

  try {
    await getDatabase()
      .insert(AccountTable)
      .values({
        address: body.address.toLowerCase(),
        display,
      })
      .onConflictDoUpdate({
        target: AccountTable.address,
        set: { display },
      });

    return { status: 200 };
  } catch (err) {
    console.error(err);
    return { status: 400, error: 'failed to update display handle' };
  }
}
