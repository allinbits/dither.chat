import { type Posts } from '@atomone/dither-api-types';
import { sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { FollowsTable } from '../../drizzle/schema';

const statementAddFollower = getDatabase()
    .insert(FollowsTable)
    .values({
        follower: sql.placeholder('follower'),
        following: sql.placeholder('following'),
        hash: sql.placeholder('hash'),
        timestamp: sql.placeholder('timestamp'),
    })
    .onConflictDoNothing()
    .prepare('stmnt_add_follower');

export async function Follow(body: typeof Posts.FollowBody.static) {
    try {
        await statementAddFollower.execute({
            follower: body.from.toLowerCase(),
            following: body.address.toLowerCase(),
            hash: body.hash.toLowerCase(),
            timestamp: new Date(body.timestamp),
        });

        return { status: 200 };
    }
    catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to add follow, follow likely already exists' };
    }
}
