import { pgTable, varchar, customType, timestamp } from 'drizzle-orm/pg-core';

const MEMO_LENGTH = 512;

type AuthorType = { address: string; hash: string; amount?: string };

export const AuthorComposite = customType<{ data: AuthorType[]; driverData: string }>({
    dataType() {
        return 'jsonb';
    },
    toDriver(value: AuthorType[]): string {
        return JSON.stringify(value);
    },
    fromDriver(value): AuthorType[] {
        if (typeof value === 'string') {
            return JSON.parse(value);
        } else if (value === null) {
            return [];
        } else {
            return value;
        }
    },
});

export const FeedTable = pgTable('feed', {
    hash: varchar({ length: 64 }).primaryKey(),
    author: varchar({ length: 44 }).notNull(),
    timestamp: timestamp({ withTimezone: true }).notNull(),
    message: varchar({ length: MEMO_LENGTH }).notNull(),
});

export const ReplyTable = pgTable('replies', {
    hash: varchar({ length: 64 }).primaryKey(),
    post_hash: varchar({ length: 64 }).notNull(),
    author: varchar({ length: 44 }).notNull(),
    timestamp: timestamp({ withTimezone: true }).notNull(),
    message: varchar({ length: MEMO_LENGTH }).notNull(),
});

export const LikesTable = pgTable('likes', {
    hash: varchar({ length: 64 }).primaryKey(),
    data: AuthorComposite().default([]),
});

export const DislikesTable = pgTable('dislikes', {
    hash: varchar({ length: 64 }).primaryKey(),
    data: AuthorComposite().default([]),
});

export const FlagsTable = pgTable('flags', {
    hash: varchar({ length: 64 }).primaryKey(),
    data: AuthorComposite().default([]),
});

export const UsersTable = pgTable('users', {
    address: varchar({ length: 44 }).primaryKey(),
    followers: AuthorComposite().default([]),
    following: AuthorComposite().default([]),
});

export const tables = ['feed', 'replies', 'likes', 'dislikes', 'flags', 'users'];
