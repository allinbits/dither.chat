import { pgTable, varchar, timestamp, serial, index, primaryKey, text, integer, bigint } from 'drizzle-orm/pg-core';

const MEMO_LENGTH = 512;

export const FeedTable = pgTable(
    'feed',
    {
        id: serial('id').primaryKey(),
        hash: varchar({ length: 64 }).notNull(),
        author: varchar({ length: 44 }).notNull(),
        timestamp: timestamp({ withTimezone: true }).notNull(),
        message: varchar({ length: MEMO_LENGTH }).notNull(),
        quantity: bigint({ mode: 'number' }).notNull(),
        replies: integer().default(0),
        likes: integer().default(0),
        dislikes: integer().default(0),
        flags: integer().default(0),
        likes_burnt: bigint({ mode: 'number' }).default(0),
        dislikes_burnt: bigint({ mode: 'number' }).default(0),
        flags_burnt: bigint({ mode: 'number' }).default(0),
        deleted_at: timestamp({ withTimezone: true }),
        deleted_reason: text(),
        post_hash: varchar({ length: 64 }),
    },
    (t) => [index('feed_hash_index').on(t.hash), index('post_hash_index').on(t.post_hash)]
);

export const DislikesTable = pgTable(
    'dislikes',
    {
        post_hash: varchar({ length: 64 }).notNull(),
        author: varchar({ length: 44 }).notNull(),
        hash: varchar({ length: 64 }).notNull(),
        quantity: text().notNull(),
        timestamp: timestamp({ withTimezone: true }).notNull(),
    },
    (t) => [
        primaryKey({ columns: [t.post_hash, t.hash] }),
        index('dislike_post_hash_idx').on(t.post_hash),
        index('dislike_author_idx').on(t.author),
    ]
);

export const LikesTable = pgTable(
    'likes',
    {
        post_hash: varchar({ length: 64 }).notNull(),
        author: varchar({ length: 44 }).notNull(),
        hash: varchar({ length: 64 }).notNull(),
        quantity: text().notNull(),
        timestamp: timestamp({ withTimezone: true }).notNull(),
    },
    (t) => [
        primaryKey({ columns: [t.post_hash, t.hash] }),
        index('like_post_hash_idx').on(t.post_hash),
        index('like_author_idx').on(t.author),
    ]
);

export const FlagsTable = pgTable(
    'flags',
    {
        post_hash: varchar({ length: 64 }).notNull(),
        author: varchar({ length: 44 }).notNull(),
        hash: varchar({ length: 64 }).notNull(),
        quantity: text().notNull(),
        timestamp: timestamp({ withTimezone: true }).notNull(),
    },
    (t) => [
        primaryKey({ columns: [t.post_hash, t.hash] }),
        index('flags_post_hash_idx').on(t.post_hash),
        index('flag_author_idx').on(t.author),
    ]
);

export const FollowsTable = pgTable(
    'follows',
    {
        follower: varchar({ length: 44 }).notNull(),
        following: varchar({ length: 44 }).notNull(),
        hash: varchar({ length: 64 }).notNull(),
        timestamp: timestamp({ withTimezone: true }).notNull(),
        deleted_at: timestamp({ withTimezone: true }),
    },
    (t) => [
        primaryKey({ columns: [t.follower, t.following] }),
        index('follower_id_idx').on(t.follower),
        index('following_id_idx').on(t.following),
    ]
);

export const tables = ['feed', 'likes', 'dislikes', 'flags', 'follows'];
