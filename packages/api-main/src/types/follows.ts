import type { InferSelectModel } from 'drizzle-orm';

import { createSelectSchema } from 'drizzle-typebox';

import { FollowsTable } from '../../drizzle/schema';

export type Follow = InferSelectModel<typeof FollowsTable>;
export const followSchema = createSelectSchema(FollowsTable);
