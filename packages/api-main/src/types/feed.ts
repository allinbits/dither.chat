import type { InferSelectModel } from 'drizzle-orm';

import { Type } from '@sinclair/typebox';
import { createSelectSchema } from 'drizzle-typebox';

import { FeedTable } from '../../drizzle/schema';

export type Post = InferSelectModel<typeof FeedTable>;
export const postSchema = createSelectSchema(FeedTable);

export interface PostWithRepost extends Post {
  reposted_by: string | null;
  reposted_at: Date | null;
}

export const postWithRepostSchema = Type.Intersect([
  postSchema,
  Type.Object({
    reposted_by: Type.Union([Type.String(), Type.Null()]),
    reposted_at: Type.Union([Type.Date(), Type.Null()]),
  }),
]);

export interface ReplyWithParent {
  reply: InferSelectModel<typeof FeedTable>;
  parent: InferSelectModel<typeof FeedTable>;
};
export const replyWithParentSchema = Type.Object({
  reply: postSchema,
  parent: postSchema,
});
