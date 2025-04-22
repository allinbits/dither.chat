import { pgTable, varchar, jsonb, index, customType } from 'drizzle-orm/pg-core';

const ADDRESS_LENGTH = 44;
const TRANSACTION_HASH_LENGTH = 64;
const HEIGHT_LENGTH = 20;
const TIMESTAMP_LENGTH = 26;
const MEMO_LENGTH = 512;

type AuthorType = { address: string; hash: string; amount: string };

export const AuthorComposite = customType<{ data: AuthorType; driverData: string }>({
    dataType() {
        return 'text';
    },
    fromDriver(value): AuthorType {
        const [address, hash, amount] = value.slice(1, -1).split(',');
        return { address, hash, amount };
    },
    toDriver(value: AuthorType) {
        return `(${value.address},${value.hash},${value.amount})`;
    },
});

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
    (table) => [index('feed_author_idx').on(table.author)]
);

export const ReplyTable = pgTable(
    'replies',
    {
        hash: varchar({ length: TRANSACTION_HASH_LENGTH }).primaryKey(),
        post_hash: varchar({ length: TRANSACTION_HASH_LENGTH }).notNull(),
        author: varchar({ length: ADDRESS_LENGTH }).notNull(),
        height: varchar({ length: HEIGHT_LENGTH }).notNull(),
        timestamp: varchar({ length: TIMESTAMP_LENGTH }).notNull(),
        memo: varchar({ length: MEMO_LENGTH }).notNull(),
        messages: jsonb().notNull().$type<{ [key: string]: any }>(),
    },
    (table) => [index('replies_post_hash_idx').on(table.post_hash), index('replies_author_idx').on(table.author)]
);

export const LikesTable = pgTable('likes', {
    hash: varchar({ length: TRANSACTION_HASH_LENGTH }).primaryKey(),
    data: AuthorComposite().array().default([]),
});

export const DislikesTable = pgTable('dislikes', {
    hash: varchar({ length: TRANSACTION_HASH_LENGTH }).primaryKey(),
    data: AuthorComposite().array().default([]),
});

export const FlagsTable = pgTable('flags', {
    hash: varchar({ length: TRANSACTION_HASH_LENGTH }).primaryKey(),
    data: AuthorComposite().array().default([]),
});

export const UsersTable = pgTable('users', {
    address: varchar({ length: TRANSACTION_HASH_LENGTH }).primaryKey(),
    followers: varchar({ length: ADDRESS_LENGTH }).array().default([]),
    following: varchar({ length: ADDRESS_LENGTH }).array().default([]),
});
