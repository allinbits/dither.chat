import { Gets } from '@atomone/dither-api-types';
import { Elysia } from 'elysia';

import * as GetRequests from '../gets/index';

/**
 * Routes that require user authentication via JWT cookie
 */
export const userRoutes = new Elysia()
    .get('/notifications', ({ query, cookie: { auth } }) => GetRequests.Notifications(query, auth), {
        query: Gets.NotificationsQuery,
    })
    .get('/notifications-count', ({ query, cookie: { auth } }) => GetRequests.NotificationsCount(query, auth), {
        query: Gets.NotificationsCountQuery,
    })
    .post('/notification-read', ({ query, cookie: { auth } }) => GetRequests.ReadNotification(query, auth), {
        query: Gets.ReadNotificationQuery,
    });
