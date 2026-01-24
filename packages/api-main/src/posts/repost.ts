import type { Posts } from '@atomone/dither-api-types';

import { eq, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { FeedTable, RepostsTable } from '../../drizzle/schema';
import { notify } from '../shared/notify';
import { useSharedQueries } from '../shared/useSharedQueries';
import { postToDiscord } from '../utility';

const sharedQueries = useSharedQueries();

const statement = getDatabase()
  .insert(RepostsTable)
  .values({
    post_hash: sql.placeholder('post_hash'),
    hash: sql.placeholder('hash'),
    author: sql.placeholder('author'),
    quantity: sql.placeholder('quantity'),
    timestamp: sql.placeholder('timestamp'),
  })
  .onConflictDoNothing()
  .prepare('stmnt_add_repost');

const statementAddRepostToPost = getDatabase()
  .update(FeedTable)
  .set({
    reposts: sql`${FeedTable.reposts} + 1`,
  })
  .where(eq(FeedTable.hash, sql.placeholder('post_hash')))
  .prepare('stmnt_add_repost_count_to_post');

export async function Repost(body: Posts.RepostBody) {
  if (body.post_hash.length !== 64) {
    return { status: 400, error: 'Provided post_hash is not valid for repost' };
  }

  try {
    const result = await sharedQueries.doesPostExist(body.post_hash);
    if (result.status !== 200) {
      return { status: result.status, error: 'provided post_hash does not exist' };
    }

    const resultChanges = await statement.execute({
      post_hash: body.post_hash.toLowerCase(),
      hash: body.hash.toLowerCase(),
      author: body.from.toLowerCase(),
      quantity: body.quantity,
      timestamp: new Date(body.timestamp),
    });

    // Ensure that 'repost' was triggered, and not already existing.
    if (typeof resultChanges.rowCount === 'number' && resultChanges.rowCount >= 1) {
      await statementAddRepostToPost.execute({ post_hash: body.post_hash });
      await notify({
        post_hash: body.post_hash,
        hash: body.hash,
        type: 'repost',
        timestamp: new Date(body.timestamp),
        actor: body.from,
      });
    }

    await postToDiscord(`Reposted by ${body.from.toLowerCase()}`, `https://dither.chat/post/${body.hash.toLowerCase()}`);
    return { status: 200 };
  } catch (err) {
    console.error(err);
    return { status: 400, error: 'failed to upsert data for repost, repost already exists' };
  }
}
