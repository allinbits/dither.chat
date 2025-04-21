import { pgTable, varchar, jsonb, index, integer } from 'drizzle-orm/pg-core';

type TokenBurn = { hash: string; address: string; amount: { denom: string; amount: string }[] };

const ADDRESS_LENGTH = 44;
const TRANSACTION_HASH_LENGTH = 64;
const HEIGHT_LENGTH = 20;
const TIMESTAMP_LENGTH = 26;
const MEMO_LENGTH = 512;

export const FeedTable = pgTable(
    'feed',
    {
        hash: varchar({ length: TRANSACTION_HASH_LENGTH }).primaryKey(),
        author: varchar({ length: ADDRESS_LENGTH }).notNull(),
        height: varchar({ length: HEIGHT_LENGTH }).notNull(),
        timestamp: varchar({ length: TIMESTAMP_LENGTH }).notNull(),
        message: varchar({ length: MEMO_LENGTH }).notNull(),
        messages: jsonb().notNull().$type<{ [key: string]: any }>(),
    },
    (table) => [index('author_idx').on(table.author)]
);

export const ReplyTable = pgTable(
    'replies',
    {
        hash: varchar({ length: TRANSACTION_HASH_LENGTH }).primaryKey(),
        post_hash: varchar({ length: TRANSACTION_HASH_LENGTH }).primaryKey(),
        author: varchar({ length: ADDRESS_LENGTH }).notNull(),
        height: varchar({ length: HEIGHT_LENGTH }).notNull(),
        timestamp: varchar({ length: TIMESTAMP_LENGTH }).notNull(),
        memo: varchar({ length: MEMO_LENGTH }).notNull(),
        messages: jsonb().notNull().$type<{ [key: string]: any }>(),
    },
    (table) => [index('post_hash_idx').on(table.post_hash), index('author_idx').on(table.author)]
);

export const LikesTable = pgTable('likes', {
    hash: varchar({ length: TRANSACTION_HASH_LENGTH }).primaryKey(),
    data: jsonb().notNull().$type<TokenBurn>(),
});

export const DislikesTable = pgTable('dislikes', {
    hash: varchar({ length: TRANSACTION_HASH_LENGTH }).primaryKey(),
    data: jsonb().notNull().$type<TokenBurn>(),
});

export const FlagsTable = pgTable('flags', {
    hash: varchar({ length: TRANSACTION_HASH_LENGTH }).primaryKey(),
    data: jsonb().notNull().$type<TokenBurn>(),
});

export const UsersTable = pgTable('users', {
    address: varchar({ length: TRANSACTION_HASH_LENGTH }).primaryKey(),
    followers: varchar({ length: ADDRESS_LENGTH }).array().default([]),
    following: varchar({ length: ADDRESS_LENGTH }).array().default([]),
    followersCount: integer().default(0),
    followingCount: integer().default(0),
});
