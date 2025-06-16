import type { InferSelectModel } from 'drizzle-orm';

import { createSelectSchema } from 'drizzle-typebox';

import { NotificationTable } from '../../drizzle/schema';

export type Notification = InferSelectModel<typeof NotificationTable>;
export const notificationSchema = createSelectSchema(NotificationTable);
