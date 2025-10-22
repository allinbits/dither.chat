import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { createSelectSchema } from 'drizzle-typebox';

import { FollowsTable } from '../../drizzle/schema';

export const followSchema = createSelectSchema(FollowsTable);

export const followingSchema = Type.Object({
  address: followSchema.properties.following,
  hash: followSchema.properties.hash,
});
export type Following = Static<typeof followingSchema>;
