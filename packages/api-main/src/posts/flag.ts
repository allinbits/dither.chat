import { eq, sql } from 'drizzle-orm';
import { t } from 'elysia';

import { getDatabase } from '../../drizzle/db';
import { FeedTable, FlagsTable } from '../../drizzle/schema';

export const FlagBody = t.Object({
  hash: t.String(),
  from: t.String(),
  postHash: t.String(),
  quantity: t.String(),
  timestamp: t.String(),
});

const statement = getDatabase()
  .insert(FlagsTable)
  .values({
    post_hash: sql.placeholder('post_hash'),
    hash: sql.placeholder('hash'),
    author: sql.placeholder('author'),
    quantity: sql.placeholder('quantity'),
    timestamp: sql.placeholder('timestamp'),
  })
  .prepare('stmnt_add_flag');

const statementAddFlagToPost = getDatabase()
  .update(FeedTable)
  .set({
    flags: sql`${FeedTable.flags} + 1`,
    flags_burnt: sql`${FeedTable.flags_burnt} + ${sql.placeholder('quantity')}`,
  })
  .where(eq(FeedTable.hash, sql.placeholder('post_hash')))
  .prepare('stmnt_add_flag_count_to_post');

export async function Flag(body: typeof FlagBody.static) {
  try {
    await statement.execute({
      post_hash: body.postHash,
      hash: body.hash,
      author: body.from,
      quantity: body.quantity,
      timestamp: new Date(body.timestamp),
    });

    await statementAddFlagToPost.execute({ post_hash: body.postHash, quantity: body.quantity });

    return { status: 200 };
  }
  catch (err) {
    console.error(err);
    return { status: 400, error: 'failed to upsert data for flag, flag already exists' };
  }
}
