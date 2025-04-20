import { pgTable, varchar, jsonb } from 'drizzle-orm/pg-core';

export const FeedTable = pgTable('feed', {
    hash: varchar({ length: 64 }).primaryKey(),
    height: varchar({ length: 255 }).notNull(),
    timestamp: varchar({ length: 255 }).notNull(),
    memo: varchar({ length: 512 }).notNull(),
    messages: jsonb().notNull().$type<{ '@type': string; [key: string]: any }>(),
});

export const ReplyTable = pgTable('replies', {
    hash: varchar({ length: 64 }).primaryKey(),
    height: varchar({ length: 255 }).notNull(),
    timestamp: varchar({ length: 255 }).notNull(),
    memo: varchar({ length: 512 }).notNull(),
    messages: jsonb().notNull().$type<{ '@type': string; [key: string]: any }>(),
});

export const LikesTable = pgTable('likes', {
    hash: varchar({ length: 64 }).primaryKey(),
    data: jsonb().notNull().$type<{ hash: string; address: string; amount: { denom: string; amount: string }[] }>(),
});

export const DislikesTable = pgTable('dislikes', {
    hash: varchar({ length: 64 }).primaryKey(),
    data: jsonb().notNull().$type<{ hash: string; address: string; amount: { denom: string; amount: string }[] }>(),
});

export const FlagsTable = pgTable('flags', {
    hash: varchar({ length: 64 }).primaryKey(),
    data: jsonb().notNull().$type<{ hash: string; address: string; amount: { denom: string; amount: string }[] }>(),
});

export const FollowersTable = pgTable('followers', {
    address: varchar({ length: 44 }).primaryKey(),
    data: jsonb().notNull().$type<{ hash: string; address: string }>(),
});

export const FollowingTable = pgTable('following', {
    address: varchar({ length: 44 }).primaryKey(),
    data: jsonb().notNull().$type<{ hash: string; address: string }>(),
});
