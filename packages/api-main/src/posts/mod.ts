import { and, eq, isNull, sql, inArray } from 'drizzle-orm';
import { t } from 'elysia';

import { getDatabase } from '../../drizzle/db';
import { AuditTable, FeedTable, ModeratorTable } from '../../drizzle/schema';

export const ModRemovePostBody = t.Object({
    hash: t.String(),
    mod_address: t.String(),
    post_hash: t.String(),
    reason: t.String(),
    timestamp: t.String(),
});

const statementInsertAudit = getDatabase()
    .insert(AuditTable)
    .values({
        post_hash: sql.placeholder('post_hash'),
        user_address: sql.placeholder('user_address'),
        hash: sql.placeholder('hash'),
        created_by: sql.placeholder('created_by'),
        created_at: sql.placeholder('created_at'),
        restored_by: sql.placeholder('restored_by'),
        restored_at: sql.placeholder('restored_at'),
        reason: sql.placeholder('reason'),
    })
    .prepare('stmnt_add_like');

export async function ModRemovePost(body: typeof ModRemovePostBody.static) {
    try {
        const [post] = await getDatabase().select().from(FeedTable).where(eq(FeedTable.hash, body.post_hash)).limit(1);
        if (!post) {
            return { status: 404, error: 'post not found' };
        }

        const [mod] = await getDatabase()
            .select()
            .from(ModeratorTable)
            .where(eq(ModeratorTable.address, body.mod_address))
            .limit(1);
        if (!mod) {
            return { status: 404, error: 'moderator not found' };
        }

        const statement = getDatabase()
            .update(FeedTable)
            .set({
                removed_at: new Date(body.timestamp),
                removed_hash: body.hash,
                removed_by: mod.address,
            })
            .where(eq(FeedTable.hash, body.post_hash))
            .returning();

        await statement.execute();

        await statementInsertAudit.execute({
            post_hash: body.post_hash,
            hash: body.hash,
            created_by: mod.address,
            created_at: new Date(body.timestamp),
            reason: body.reason,
        });

        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to delete post, maybe invalid' };
    }
}

export async function ModRestorePost(body: typeof ModRemovePostBody.static) {
    try {
        const [post] = await getDatabase().select().from(FeedTable).where(eq(FeedTable.hash, body.post_hash)).limit(1);
        if (!post) {
            return { status: 404, error: 'post not found' };
        }

        if (!post.removed_at) {
            return { status: 404, error: 'post not removed' };
        }

        const [mod] = await getDatabase()
            .select()
            .from(ModeratorTable)
            .where(eq(ModeratorTable.address, body.mod_address))
            .limit(1);
        if (!mod) {
            return { status: 404, error: 'moderator not found' };
        }

        const [postWasRemovedByMod] = await getDatabase()
            .select()
            .from(ModeratorTable)
            .where(eq(ModeratorTable.address, post.removed_by ?? ''))
            .limit(1);
        if (!postWasRemovedByMod) {
            return { status: 404, error: 'cannot restore a post removed by the user' };
        }

        const statement = getDatabase()
            .update(FeedTable)
            .set({
                removed_at: null,
                removed_hash: null,
                removed_by: null,
            })
            .where(eq(FeedTable.hash, body.post_hash))
            .returning();

        await statement.execute();

        await statementInsertAudit.execute({
            post_hash: body.post_hash,
            hash: body.hash,
            restored_by: mod.address,
            restored_at: new Date(body.timestamp),
            reason: body.reason,
        });

        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to delete post, maybe invalid' };
    }
}

export const ModBanBody = t.Object({
    hash: t.String(),
    mod_address: t.String(),
    user_address: t.String(),
    reason: t.String(),
    timestamp: t.String(),
});

export async function ModBan(body: typeof ModBanBody.static) {
    try {
        const [mod] = await getDatabase()
            .select()
            .from(ModeratorTable)
            .where(eq(ModeratorTable.address, body.mod_address))
            .limit(1);
        if (!mod) {
            return { status: 404, error: 'moderator not found' };
        }

        const statement = getDatabase()
            .update(FeedTable)
            .set({
                removed_at: new Date(body.timestamp),
                removed_hash: body.hash,
                removed_by: mod.address,
            })
            .where(and(eq(FeedTable.author, body.user_address), isNull(FeedTable.removed_at)))
            .returning();

        await statement.execute();

        await statementInsertAudit.execute({
            user_address: body.user_address,
            hash: body.hash,
            created_by: mod.address,
            created_at: new Date(body.timestamp),
            reason: body.reason,
        });

        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to ban user' };
    }
}

export async function ModUnban(body: typeof ModBanBody.static) {
    try {
        const [mod] = await getDatabase()
            .select()
            .from(ModeratorTable)
            .where(eq(ModeratorTable.address, body.mod_address))
            .limit(1);
        if (!mod) {
            return { status: 404, error: 'moderator not found' };
        }

        const statement = getDatabase()
            .update(FeedTable)
            .set({
                removed_at: null,
                removed_hash: null,
                removed_by: null,
            })
            .where(
                and(
                    eq(FeedTable.author, body.user_address),
                    // Only restore posts that were removed by a moderator
                    inArray(
                        FeedTable.removed_by,
                        getDatabase().select({ value: ModeratorTable.address }).from(ModeratorTable),
                    ),
                ),
            )
            .returning();

        await statement.execute();

        await statementInsertAudit.execute({
            user_address: body.user_address,
            hash: body.hash,
            restored_by: mod.address,
            restored_at: new Date(body.timestamp),
            reason: body.reason,
        });

        return { status: 200 };
    } catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to ban user' };
    }
}
