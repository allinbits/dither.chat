import type { InferSelectModel } from 'drizzle-orm';

import { createSelectSchema } from 'drizzle-typebox';

import { FeedTable } from '../../drizzle/schema';

export type Post = InferSelectModel<typeof FeedTable>;
export const postSchema = createSelectSchema(FeedTable);

export interface ReplyWithParent {
    reply: InferSelectModel<typeof FeedTable>;
    parent: InferSelectModel<typeof FeedTable>;
};
