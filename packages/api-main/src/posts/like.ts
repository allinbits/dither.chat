import { t } from 'elysia';
import { LikesTable } from '../../drizzle/schema';
import { db } from '../../drizzle/db';
import { getTransferMessage, getTransferQuantities } from '../utility';
import { extractMemoContent } from '@atomone/chronostate';
import { eq, sql } from 'drizzle-orm';

export const LikeBody = t.Object({
    hash: t.String(),
    memo: t.String(),
    messages: t.Array(t.Record(t.String(), t.Any())),
});

export async function Like(body: typeof LikeBody.static) {
    const msgTransfer = getTransferMessage(body.messages);
    if (!msgTransfer) {
        return { status: 400, error: 'transfer message must exist to be logged as a post' };
    }

    const amount = getTransferQuantities(body.messages);
    const [like_hash] = extractMemoContent(body.memo, 'dither.Like');
    if (!like_hash) {
        return { status: 400, error: 'memo must contain a like address for dither.Like' };
    }

    try {
        const results = await db.select().from(LikesTable).where(eq(LikesTable.hash, like_hash));
        if (results.length >= 1) {
            const author = JSON.stringify([
                {
                    hash: body.hash,
                    amount,
                    address: msgTransfer.from_address,
                },
            ]);

            await db.update(LikesTable).set({
                data: sql`${LikesTable.data} || ${author}::jsonb`,
            });
        } else {
            await db
                .insert(LikesTable)
                .values({
                    hash: like_hash,
                    data: [{ address: msgTransfer.from_address, hash: body.hash, amount }],
                })
                .onConflictDoNothing();
        }

        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to upsert data for post' };
    }
}
