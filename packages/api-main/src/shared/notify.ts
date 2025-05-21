import { eq, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { FeedTable, NotificationTable } from '../../drizzle/schema';

const statementInsertNotification = getDatabase()
    .insert(NotificationTable)
    .values({
        owner: sql.placeholder('owner'),
        hash: sql.placeholder('hash'),
        type: sql.placeholder('type'),
        timestamp: sql.placeholder('timestamp'),
    })
    .prepare('stmnt_insert_notification');

export const notify = async (data: {
    hash: string;
    type: string;
    timestamp: Date;
    post_hash?: string;
    owner?: string;
}) => {
    let owner = data.owner;
    if (!owner) {
        if (!data.post_hash) {
            throw new Error('post_hash or owner is required');
        }
        // Owner was not send, take if from post
        const [post] = await getDatabase()
            .select()
            .from(FeedTable)
            .where(eq(FeedTable.hash, data.post_hash.toLowerCase()))
            .limit(1);
        if (!post) {
            throw new Error('post not found');
        }
        owner = post.author;
    }
    await statementInsertNotification.execute({
        owner: owner.toLowerCase(),
        hash: data.hash.toLowerCase(),
        type: data.type,
        timestamp: data.timestamp,
    });
};
