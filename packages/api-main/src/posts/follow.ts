import { type Posts } from '@atomone/dither-api-types';
import { sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { FollowsTable } from '../../drizzle/schema';
import { notify } from '../shared/notify';

const statementAddFollower = getDatabase()
    .insert(FollowsTable)
    .values({
        follower: sql.placeholder('follower'),
        following: sql.placeholder('following'),
        hash: sql.placeholder('hash'),
        timestamp: sql.placeholder('timestamp'),
    })
    .onConflictDoUpdate({
        target: [FollowsTable.follower, FollowsTable.following],
        set: {
            removed_at: null,
        },
    })
    .prepare('stmnt_add_follower');

export async function Follow(body: typeof Posts.FollowBody.static) {
    if (body.hash.length !== 64) {
        return { status: 400, error: 'Provided hash is not valid for follow' };
    }

    if (body.address.length !== 44) {
        return { status: 400, error: 'Provided address is not valid for follow' };
    }

    if (body.from.length !== 44) {
        return { status: 400, error: 'Provided from address is not valid for follow' };
    }

    if (body.from === body.address) {
        return { status: 400, error: 'Provided from address cannot equal provided address, cannot follow self' };
    }

    try {
        const result = await statementAddFollower.execute({
            follower: body.from.toLowerCase(),
            following: body.address.toLowerCase(),
            hash: body.hash.toLowerCase(),
            timestamp: new Date(body.timestamp),
        });

        if (typeof result.rowCount !== 'number' || result.rowCount <= 0) {
            return { status: 400, error: 'failed to add follow, follow already exists' };
        }

        await notify({
            owner: body.address,
            hash: body.hash,
            type: 'follow',
            timestamp: new Date(body.timestamp),
        });

        return { status: 200 };
    }
    catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to communicate with database' };
    }
}
