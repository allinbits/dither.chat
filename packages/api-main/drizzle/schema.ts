import { pgTable, varchar, jsonb, index } from 'drizzle-orm/pg-core';

type TokenBurn = { hash: string; address: string; amount: { denom: string; amount: string }[] };

type UserFollow = { hash: string; address: string };

export const FeedTable = pgTable(
    'feed',
    {
        hash: varchar({ length: 64 }).primaryKey(),
        author: varchar({ length: 44 }).notNull(),
        height: varchar({ length: 255 }).notNull(),
        timestamp: varchar({ length: 255 }).notNull(),
        memo: varchar({ length: 512 }).notNull(),
        messages: jsonb().notNull().$type<{ [key: string]: any }>(),
    },
    (table) => [index('author_idx').on(table.author)]
);

export const ReplyTable = pgTable(
    'replies',
    {
        hash: varchar({ length: 64 }).primaryKey(),
        author: varchar({ length: 44 }).notNull(),
        height: varchar({ length: 255 }).notNull(),
        timestamp: varchar({ length: 255 }).notNull(),
        memo: varchar({ length: 512 }).notNull(),
        messages: jsonb().notNull().$type<{ [key: string]: any }>(),
    },
    (table) => [index('author_idx').on(table.author)]
);

export const LikesTable = pgTable('likes', {
    hash: varchar({ length: 64 }).primaryKey(),
    data: jsonb().notNull().$type<TokenBurn>(),
});

export const DislikesTable = pgTable('dislikes', {
    hash: varchar({ length: 64 }).primaryKey(),
    data: jsonb().notNull().$type<TokenBurn>(),
});

export const FlagsTable = pgTable('flags', {
    hash: varchar({ length: 64 }).primaryKey(),
    data: jsonb().notNull().$type<TokenBurn>(),
});

export const FollowersTable = pgTable('followers', {
    address: varchar({ length: 44 }).primaryKey(),
    data: jsonb().notNull().$type<UserFollow>(),
});

export const FollowingTable = pgTable('following', {
    address: varchar({ length: 44 }).primaryKey(),
    data: jsonb().notNull().$type<UserFollow>(),
});
