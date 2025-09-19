import { sql } from 'drizzle-orm';
import { bigint, boolean, index, integer, pgEnum, pgTable, primaryKey, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

const MEMO_LENGTH = 512;

export const FeedTable = pgTable(
    'feed',
    {
        hash: varchar({ length: 64 }).primaryKey(), // Main hash from the transaction
        post_hash: varchar({ length: 64 }), // Optional, this makes a post a reply, provided through memo
        author: varchar({ length: 44 }).notNull(), // Address of user, usually in the transfer message
        timestamp: timestamp({ withTimezone: true }).notNull(), // Timestamp parsed with new Date()
        message: varchar({ length: MEMO_LENGTH }).notNull(), // The message inside of the memo
        quantity: text().default('0'), // The total amount of tokens the user spent to post this message
        replies: integer().default(0), // The amount of replies this post / reply has
        likes: integer().default(0), // The amount of likes this post / reply has
        dislikes: integer().default(0), // The amount of dislikes this post / reply has
        flags: integer().default(0), // The amount of flags this post / reply has
        likes_burnt: text().default('0'), // The amount of tokens burnt from each user who liked this post / reply
        dislikes_burnt: text().default('0'), // The amount of tokens burnt from each user who disliked this post / reply
        flags_burnt: text().default('0'), // The amount of tokens burnt from each user who wante dto flag this post / reply
        removed_hash: varchar({ length: 64 }), // The hash that corresponds with the soft delete request
        removed_at: timestamp({ withTimezone: true }), // When this post was removed
        removed_by: varchar({ length: 44 }), // Who removed this post
    },
    t => [
        index('feed_hash_index').on(t.hash),
        index('post_hash_index').on(t.post_hash),
        index('message_search_index').using('gin', sql`to_tsvector('english', ${t.message})`),
    ],
);

export const DislikesTable = pgTable(
    'dislikes',
    {
        hash: varchar({ length: 64 }).primaryKey(),
        post_hash: varchar({ length: 64 }).notNull(),
        author: varchar({ length: 44 }).notNull(),
        quantity: text().default('0'),
        timestamp: timestamp({ withTimezone: true }).notNull(),
    },
    t => [
        index('dislike_post_hash_idx').on(t.post_hash),
        index('dislike_author_idx').on(t.author),
    ],
);

export const LikesTable = pgTable(
    'likes',
    {
        hash: varchar({ length: 64 }).primaryKey(),
        post_hash: varchar({ length: 64 }).notNull(),
        author: varchar({ length: 44 }).notNull(),
        quantity: text().default('0'),
        timestamp: timestamp({ withTimezone: true }).notNull(),
    },
    t => [
        index('like_post_hash_idx').on(t.post_hash),
        index('like_author_idx').on(t.author),
    ],
);

export const FlagsTable = pgTable(
    'flags',
    {
        hash: varchar({ length: 64 }).primaryKey(),
        post_hash: varchar({ length: 64 }).notNull(),
        author: varchar({ length: 44 }).notNull(),
        quantity: text().default('0'),
        timestamp: timestamp({ withTimezone: true }).notNull(),
    },
    t => [
        index('flags_post_hash_idx').on(t.post_hash),
        index('flag_author_idx').on(t.author),
    ],
);

export const FollowsTable = pgTable(
    'follows',
    {
        follower: varchar({ length: 44 }).notNull(),
        following: varchar({ length: 44 }).notNull(),
        hash: varchar({ length: 64 }).notNull(),
        timestamp: timestamp({ withTimezone: true }).notNull(),
        removed_at: timestamp({ withTimezone: true }),
    },
    t => [
        primaryKey({ columns: [t.follower, t.following] }),
        index('follower_id_idx').on(t.follower),
        index('following_id_idx').on(t.following),
    ],
);

export const AuthRequests = pgTable(
    'authrequests',
    {
        id: serial('id').primaryKey(),
        msg: varchar().notNull(),
        timestamp: timestamp({ withTimezone: true }).notNull(),
    },
);

export const rateLimits = pgTable(
    'ratelimits',
    {
        id: serial('id').primaryKey(),
        ip: text().notNull().unique(),
        requests: integer().notNull().default(0),
        lastRequest: bigint({ mode: 'string' }).notNull(),
    },
);

// Audits are append only
export const AuditTable = pgTable('audits', {
    id: serial('id').primaryKey(),
    hash: varchar({ length: 64 }).notNull(),
    post_hash: varchar({ length: 64 }), // This is a post removal
    user_address: varchar({ length: 44 }), // This is a user removal
    created_by: varchar({ length: 44 }),
    created_at: timestamp({ withTimezone: true }),
    reason: text(),
    restored_by: varchar({ length: 44 }), // the post or user that was restored
    restored_at: timestamp({ withTimezone: true }), // the time the post or user was restored
});

export const ModeratorTable = pgTable('moderators', {
    address: varchar({ length: 44 }).primaryKey(),
    alias: varchar({ length: 16 }), // Optional short name
    deleted_at: timestamp({ withTimezone: true }),
});

export const notificationTypeEnum = pgEnum('notification_type', ['like', 'dislike', 'flag', 'follow', 'reply']);

export const NotificationTable = pgTable(
    'notifications',
    {
        hash: varchar({ length: 64 }).notNull(),
        post_hash: varchar({ length: 64 }),
        owner: varchar({ length: 44 }).notNull(),
        actor: varchar({ length: 44 }).notNull(),
        type: notificationTypeEnum().notNull(),
        subcontext: varchar({ length: 64 }),
        timestamp: timestamp({ withTimezone: true }),
        was_read: boolean().default(false),
    },
    t => [
        primaryKey({ columns: [t.hash, t.owner] }),
        index('notification_owner_idx').on(t.owner),
    ],
);

export const ReaderState = pgTable('state', {
    id: serial().primaryKey(),
    last_block: varchar().notNull(),
});

export const tables = [
    'feed',
    'likes',
    'dislikes',
    'flags',
    'follows',
    'audits',
    'moderators',
    'notifications',
    'state',
    'authrequests',
    'ratelimits',
];
