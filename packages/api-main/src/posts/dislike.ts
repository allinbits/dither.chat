import { t } from 'elysia';
import { DislikesTable, FeedTable, ReplyTable } from '../../drizzle/schema';
import { getDatabase } from '../../drizzle/db';
import { getTransferMessage, getTransferQuantities } from '../utility';
import { extractMemoContent } from '@atomone/chronostate';
import { eq, sql } from 'drizzle-orm';

export const DislikeBody = t.Object({
    hash: t.String(),
    memo: t.String(),
    messages: t.Array(t.Record(t.String(), t.Any())),
    isReply: t.Optional(t.Boolean()),
});

const statement = getDatabase()
    .insert(DislikesTable)
    .values({
        post_hash: sql.placeholder('post_hash'),
        hash: sql.placeholder('hash'),
        author: sql.placeholder('author'),
        quantity: sql.placeholder('quantity'),
    })
    .prepare('stmnt_add_dislike');

const statementAddDislikeToPost = getDatabase()
    .update(FeedTable)
    .set({ dislikes: sql`${FeedTable.dislikes} + 1` })
    .where(eq(FeedTable.hash, sql.placeholder('post_hash')))
    .prepare('stmnt_add_dislike_count_to_post');

const statementAddDislikeToReply = getDatabase()
    .update(ReplyTable)
    .set({ likes: sql`${ReplyTable.likes} + 1` })
    .where(eq(ReplyTable.hash, sql.placeholder('post_hash')))
    .prepare('stmnt_add_flag_count_to_reply');

export async function Dislike(body: typeof DislikeBody.static) {
    const msgTransfer = getTransferMessage(body.messages);
    if (!msgTransfer) {
        return { status: 400, error: 'transfer message must exist to be logged as a post' };
    }

    const quantity = getTransferQuantities(body.messages);
    const [post_hash] = extractMemoContent(body.memo, 'dither.Dislike');
    if (!post_hash) {
        return { status: 400, error: 'memo must contain a like address for dither.Dislike' };
    }

    try {
        await statement.execute({ post_hash, hash: body.hash, author: msgTransfer.from_address, quantity });
        if (body.isReply) {
            await statementAddDislikeToReply.execute({ post_hash });
        } else {
            await statementAddDislikeToPost.execute({ post_hash });
        }

        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for dislike, dislike already exists' };
    }
}
