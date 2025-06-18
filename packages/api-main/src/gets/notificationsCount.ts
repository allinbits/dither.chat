import type { Cookie } from 'elysia';

import { type Gets } from '@atomone/dither-api-types';
import { and, eq, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { NotificationTable } from '../../drizzle/schema';
import { verifyJWT } from '../shared/jwt';

const getNotificationsCountStatement = getDatabase()
    .select({ count: sql<number>`count(*)` })
    .from(NotificationTable)
    .where(and(eq(NotificationTable.owner, sql.placeholder('owner')), eq(NotificationTable.was_read, false)))
    .prepare('stmnt_get_notifications_count');

export async function NotificationsCount(_query: typeof Gets.NotificationsCountQuery.static, auth: Cookie<string | undefined>) {
    const response = await verifyJWT(auth.value);
    if (typeof response === 'undefined') {
        return { status: 401, error: 'Unauthorized token proivided' };
    }

    try {
        const [result] = await getNotificationsCountStatement.execute({ owner: response });
        return { status: 200, count: result?.count ?? 0 };
    }
    catch (error) {
        console.error(error);
        return { status: 500, error: 'failed to count notifications' };
    }
}
