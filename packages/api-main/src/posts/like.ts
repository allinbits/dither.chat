import { t } from 'elysia';
import { FeedTable, LikesTable } from '../../drizzle/schema';
import { getDatabase } from '../../drizzle/db';
import { getTransferMessage, getTransferQuantities } from '../utility';
import { extractMemoContent } from '@atomone/chronostate';
import { eq, sql } from 'drizzle-orm';

export const LikeBody = t.Object({
    hash: t.String(),
    memo: t.String(),
    messages: t.Array(t.Record(t.String(), t.Any())),
});

const statement = getDatabase()
    .insert(LikesTable)
    .values({
        post_hash: sql.placeholder('post_hash'),
        hash: sql.placeholder('hash'),
        author: sql.placeholder('author'),
        quantity: sql.placeholder('quantity'),
    })
    .prepare('stmnt_add_like');

const statementAddLikeCount = getDatabase()
    .update(FeedTable)
    .set({ likes: sql`${FeedTable.likes} + 1` })
    .where(eq(FeedTable.hash, sql.placeholder('post_hash')))
    .prepare('stmnt_add_like_count');

export async function Like(body: typeof LikeBody.static) {
    const msgTransfer = getTransferMessage(body.messages);
    if (!msgTransfer) {
        return { status: 400, error: 'transfer message must exist to be logged as a post' };
    }

    const quantity = getTransferQuantities(body.messages);
    const [post_hash] = extractMemoContent(body.memo, 'dither.Like');
    if (!post_hash) {
        return { status: 400, error: 'memo must contain a like address for dither.Like' };
    }

    try {
        await statement.execute({ post_hash, hash: body.hash, author: msgTransfer.from_address, quantity });
        await statementAddLikeCount.execute({ post_hash });

        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for like, like already exists' };
    }
}
