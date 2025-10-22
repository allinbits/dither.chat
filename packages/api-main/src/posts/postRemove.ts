import type { Posts } from '@atomone/dither-api-types';

import { and, eq } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { FeedTable } from '../../drizzle/schema';
import { isReaderAuthorizationValid } from '../utility';

export async function PostRemove(body: typeof Posts.PostRemoveBody.static, headers: Record<string, string | undefined>) {
  if (!isReaderAuthorizationValid(headers)) {
    return { status: 401, error: 'Unauthorized to make write request' };
  }

  try {
    const selectResults = await getDatabase()
      .select()
      .from(FeedTable)
      .where(and(eq(FeedTable.hash, body.post_hash), eq(FeedTable.author, body.from)));

    const hasOwnership = selectResults.length >= 1;
    if (!hasOwnership) {
      return { status: 200, error: 'did not have ownership for post removal, ignored removal' };
    }

    const statement = getDatabase()
      .update(FeedTable)
      .set({
        removed_at: new Date(body.timestamp),
        removed_hash: body.hash.toLowerCase(),
        removed_by: body.from.toLowerCase(),
      })
      .where(eq(FeedTable.hash, body.post_hash))
      .returning();

    await statement.execute();

    return { status: 200 };
  } catch (err) {
    console.error(err);
    return { status: 400, error: 'failed to delete post, maybe invalid' };
  }
}
