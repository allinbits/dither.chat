import { eq, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { FeedTable, NotificationTable } from '../../drizzle/schema';
import { postToDiscord } from '../utility';

const statementInsertNotification = getDatabase()
    .insert(NotificationTable)
    .values({
        owner: sql.placeholder('owner'),
        hash: sql.placeholder('hash'),
        post_hash: sql.placeholder('post_hash'),
        type: sql.placeholder('type'),
        timestamp: sql.placeholder('timestamp'),
        subcontext: sql.placeholder('subcontext'),
        actor: sql.placeholder('actor'),
    })
    .onConflictDoNothing()
    .prepare('stmnt_insert_notification');

const statementGetTargetPost = getDatabase().select().from(FeedTable).where(eq(FeedTable.hash, sql.placeholder('post_hash'))).limit(1).prepare('stmnt_fetch_target_post');

export const notify = async (data: {
    hash: string;
    type: string;
    timestamp: Date;
    actor: string;
    subcontext?: string;
    post_hash?: string;
    owner?: string;
}) => {
    let owner = data.owner;

    if (data.post_hash) {
        const [post] = await statementGetTargetPost.execute({ post_hash: data.post_hash?.toLowerCase() });
        if (!post) {
            throw new Error('post not found');
        }
        owner ??= post.author;

        if (!data.subcontext) {
            const subcontext = post.message.length >= 64 ? post.message.slice(0, 61) + '...' : post.message;
            data.subcontext = subcontext;
        }
    }

    if (!owner) {
        throw new Error('failed to add owner');
    }

    if (owner === data.actor) {
        return;
    }

    await statementInsertNotification.execute({
        owner: owner.toLowerCase(),
        post_hash: data.post_hash?.toLowerCase(),
        hash: data.hash.toLowerCase(),
        type: data.type,
        timestamp: data.timestamp ?? null,
        subcontext: data.subcontext,
        actor: data.actor,
    });

    if (data.type === 'follow' || data.type === 'unfollow') {
        return;
    }

    let msg = '';

    switch (data.type) {
        case 'post':
            msg += data.subcontext;
            break;
        case 'reply':
            msg += data.subcontext;
            break;
        case 'like':
            msg += 'New Like';
            break;
        case 'dislike':
            msg += 'New Dislike';
            break;
    }

    if (msg === '') {
        return;
    }

    await postToDiscord(msg, `https://dither.chat/post/${data.hash.toLowerCase()}`);
};
