import type { InferSelectModel } from 'drizzle-orm';

import { Type } from '@sinclair/typebox';
import { createSelectSchema } from 'drizzle-typebox';

import { FeedTable } from '../../drizzle/schema';

export type Post = InferSelectModel<typeof FeedTable> & {
  author_handle?: string;
  author_display?: string;
};
export const postSchema = createSelectSchema(FeedTable);

export interface ReplyWithParent {
  reply: InferSelectModel<typeof FeedTable>;
  parent: InferSelectModel<typeof FeedTable>;
};
export const replyWithParentSchema = Type.Object({
  reply: postSchema,
  parent: postSchema,
});
