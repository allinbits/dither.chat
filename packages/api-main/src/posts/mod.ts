import type { Posts } from '@atomone/dither-api-types';

import type { Cookie } from 'elysia';
import { and, eq, isNull, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { AuditTable, FeedTable, ModeratorTable } from '../../drizzle/schema';
import { verifyJWT } from '../shared/jwt';

const statementAuditRemovePost = getDatabase()
  .insert(AuditTable)
  .values({
    post_hash: sql.placeholder('post_hash'),
    hash: sql.placeholder('hash'),
    created_by: sql.placeholder('created_by'),
    created_at: sql.placeholder('created_at'),
    reason: sql.placeholder('reason'),
  })
  .prepare('stmnt_audit_remove_post');

export async function ModRemovePost(body: typeof Posts.ModRemovePostBody.static, auth: Cookie<string | undefined>) {
  const response = await verifyJWT(auth.value);
  if (typeof response === 'undefined') {
    return { status: 401, error: 'Unauthorized token proivided' };
  }

  try {
    const [mod] = await getDatabase()
      .select()
      .from(ModeratorTable)
      .where(eq(ModeratorTable.address, response))
      .limit(1);
    if (!mod) {
      return { status: 404, error: 'moderator not found' };
    }

    const [post] = await getDatabase().select().from(FeedTable).where(eq(FeedTable.hash, body.post_hash)).limit(1);
    if (!post) {
      return { status: 404, error: 'post not found' };
    }

    const statement = getDatabase()
      .update(FeedTable)
      .set({
        removed_at: new Date(body.timestamp),
        removed_hash: body.hash.toLowerCase(),
        removed_by: mod.address.toLowerCase(),
      })
      .where(eq(FeedTable.hash, body.post_hash))
      .returning();

    await statement.execute();

    await statementAuditRemovePost.execute({
      post_hash: body.post_hash.toLowerCase(),
      hash: body.hash.toLowerCase(),
      created_by: mod.address.toLowerCase(),
      created_at: new Date(body.timestamp),
      reason: body.reason,
    });

    return { status: 200 };
  } catch (err) {
    console.error(err);
    return { status: 400, error: 'failed to delete post' };
  }
}

const statementAuditRestorePost = getDatabase()
  .insert(AuditTable)
  .values({
    post_hash: sql.placeholder('post_hash'),
    hash: sql.placeholder('hash'),
    restored_at: sql.placeholder('restored_at'),
    restored_by: sql.placeholder('restored_by'),
    reason: sql.placeholder('reason'),
  })
  .prepare('stmnt_audit_restore_post');

export async function ModRestorePost(body: typeof Posts.ModRemovePostBody.static, auth: Cookie<string | undefined>) {
  const response = await verifyJWT(auth.value);
  if (typeof response === 'undefined') {
    return { status: 401, error: 'Unauthorized token proivided' };
  }

  try {
    const [mod] = await getDatabase()
      .select()
      .from(ModeratorTable)
      .where(eq(ModeratorTable.address, response))
      .limit(1);
    if (!mod) {
      return { status: 404, error: 'moderator not found' };
    }

    const [post] = await getDatabase().select().from(FeedTable).where(eq(FeedTable.hash, body.post_hash)).limit(1);
    if (!post) {
      return { status: 404, error: 'post not found' };
    }

    if (!post.removed_at) {
      return { status: 404, error: 'post not removed' };
    }

    const [postWasRemovedByMod] = await getDatabase()
      .select()
      .from(ModeratorTable)
      .where(eq(ModeratorTable.address, post.removed_by ?? ''))
      .limit(1);
    if (!postWasRemovedByMod) {
      return { status: 401, error: 'cannot restore a post removed by the user' };
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

    await statementAuditRestorePost.execute({
      post_hash: body.post_hash.toLowerCase(),
      hash: body.hash.toLowerCase(),
      restored_by: mod.address.toLowerCase(),
      restored_at: new Date(body.timestamp),
      reason: body.reason,
    });

    return { status: 200 };
  } catch (err) {
    console.error(err);
    return { status: 400, error: 'failed to delete post, maybe invalid' };
  }
}

const statementAuditBanUser = getDatabase()
  .insert(AuditTable)
  .values({
    user_address: sql.placeholder('user_address'),
    hash: sql.placeholder('hash'),
    created_at: sql.placeholder('created_at'),
    created_by: sql.placeholder('created_by'),
    reason: sql.placeholder('reason'),
  })
  .prepare('stmnt_audit_ban_user');

export async function ModBan(body: typeof Posts.ModBanBody.static, auth: Cookie<string | undefined>) {
  const response = await verifyJWT(auth.value);
  if (typeof response === 'undefined') {
    return { status: 401, error: 'Unauthorized token proivided' };
  }

  try {
    const [mod] = await getDatabase()
      .select()
      .from(ModeratorTable)
      .where(eq(ModeratorTable.address, response))
      .limit(1);
    if (!mod) {
      return { status: 404, error: 'moderator not found' };
    }

    const statement = getDatabase()
      .update(FeedTable)
      .set({
        removed_at: new Date(body.timestamp),
        removed_hash: body.hash.toLowerCase(),
        removed_by: mod.address.toLowerCase(),
      })
      .where(and(eq(FeedTable.author, body.user_address), isNull(FeedTable.removed_at)))
      .returning();

    await statement.execute();

    await statementAuditBanUser.execute({
      user_address: body.user_address.toLowerCase(),
      hash: body.hash.toLowerCase(),
      created_by: mod.address.toLowerCase(),
      created_at: new Date(body.timestamp),
      reason: body.reason,
    });

    return { status: 200 };
  } catch (err) {
    console.error(err);
    return { status: 400, error: 'failed to ban user' };
  }
}

const statementAuditUnbanUser = getDatabase()
  .insert(AuditTable)
  .values({
    user_address: sql.placeholder('user_address'),
    hash: sql.placeholder('hash'),
    restored_at: sql.placeholder('restored_at'),
    restored_by: sql.placeholder('restored_by'),
    reason: sql.placeholder('reason'),
  })
  .prepare('stmnt_audit_unban_user');

export async function ModUnban(body: typeof Posts.ModBanBody.static, auth: Cookie<string | undefined>) {
  const response = await verifyJWT(auth.value);
  if (typeof response === 'undefined') {
    return { status: 401, error: 'Unauthorized token proivided' };
  }

  try {
    const [mod] = await getDatabase()
      .select()
      .from(ModeratorTable)
      .where(eq(ModeratorTable.address, response))
      .limit(1);
    if (!mod) {
      return { status: 404, error: 'moderator not found' };
    }

    await statementAuditUnbanUser.execute({
      user_address: body.user_address.toLowerCase(),
      hash: body.hash.toLowerCase(),
      restored_by: mod.address.toLowerCase(),
      restored_at: new Date(body.timestamp),
      reason: body.reason,
    });

    return { status: 200 };
  } catch (err) {
    console.error(err);
    return { status: 400, error: 'failed to unban user' };
  }
}
