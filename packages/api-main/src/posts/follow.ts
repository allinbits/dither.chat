import { type Posts } from '@atomone/dither-api-types';
import { and, eq, isNotNull, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { FollowsTable } from '../../drizzle/schema';
import { notify } from '../shared/notify';
import { isReaderAuthorizationValid } from '../utility';

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

export async function Follow(body: typeof Posts.FollowBody.static, headers: Record<string, string | undefined>) {
    if (!isReaderAuthorizationValid(headers)) {
        return { status: 401, error: 'Unauthorized to make write request' };
    }

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
        let result = await statementAddFollower.execute({
            follower: body.from.toLowerCase(),
            following: body.address.toLowerCase(),
            hash: body.hash.toLowerCase(),
            timestamp: new Date(body.timestamp),
        });

        if (typeof result.rowCount !== 'number' || result.rowCount <= 0) {
            // Attempts to add the follower because the entry already exists; and may be null
            result = await getDatabase().update(FollowsTable).set(
                { removed_at: null, hash: body.hash.toLowerCase() }).where(
                and(
                    eq(FollowsTable.follower, body.from.toLowerCase()),
                    eq(FollowsTable.following, body.address.toLowerCase()),
                    isNotNull(FollowsTable.removed_at),
                ),
            );

            if (typeof result.rowCount !== 'number' || result.rowCount <= 0) {
                return { status: 400, error: 'failed to add follow, follow already exists' };
            }
        }
        else {
            // Only allow for notification of a new follower once, forever
            await notify({
                owner: body.address,
                hash: body.hash,
                type: 'follow',
                timestamp: new Date(body.timestamp),
                actor: body.from,
            });
        }

        return { status: 200 };
    }
    catch (err) {
        console.error(err);
        return { status: 400, error: 'failed to communicate with database' };
    }
}
