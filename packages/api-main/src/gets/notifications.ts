import { type Gets } from '@atomone/dither-api-types';
import { and, eq, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { NotificationTable } from '../../drizzle/schema';

const getNotificationsStatement = getDatabase()
    .select()
    .from(NotificationTable)
    .where(and(eq(NotificationTable.owner, sql.placeholder('owner'))))
    .limit(sql.placeholder('limit'))
    .offset(sql.placeholder('offset'))
    .prepare('stmnt_get_notifications');

export async function Notifications(query: typeof Gets.NotificationsQuery.static, store: { userAddress: string }) {
    let limit = typeof query.limit !== 'undefined' ? Number(query.limit) : 100;
    const offset = typeof query.offset !== 'undefined' ? Number(query.offset) : 0;

    if (limit > 100) {
        limit = 100;
    }

    if (limit <= 0) {
        return { status: 400, error: 'limit must be at least 1' };
    }

    if (offset < 0) {
        return { status: 400, error: 'offset must be at least 0' };
    }

    try {
        const results = await getNotificationsStatement.execute({ owner: store.userAddress, limit, offset });
        return { status: 200, rows: results };
    }
    catch (error) {
        console.error(error);
        return { status: 404, error: 'failed to find matching reply' };
    }
}

const statementReadNotification = getDatabase()
    .update(NotificationTable)
    .set({
        was_read: true,
    })
    .where(
        and(eq(NotificationTable.hash, sql.placeholder('hash')), eq(NotificationTable.owner, sql.placeholder('owner'))),
    )
    .prepare('stmnt_read_notification');

export async function ReadNotification(query: typeof Gets.ReadNotificationQuery.static, store: { userAddress: string }) {
    try {
        const [notification] = await getDatabase()
            .select()
            .from(NotificationTable)
            .where(and(eq(NotificationTable.hash, query.hash), eq(NotificationTable.owner, store.userAddress)))
            .limit(1);
        if (!notification) {
            return { status: 404, error: 'notification not found' };
        }
        const results = await statementReadNotification.execute({ owner: store.userAddress, hash: query.hash });
        return { status: 200, rows: results };
    }
    catch (error) {
        console.error(error);
        return { status: 404, error: 'failed to find matching reply' };
    }
}
