import { pgTable, varchar, customType, timestamp } from 'drizzle-orm/pg-core';
import { bech32 } from 'bech32';
import { hexToUint8Array, uint8ArrayToHex } from '../src/utility';

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

export const AddressComposite = customType<{ data: string; driverData: number[] }>({
    dataType() {
        return 'smallint[]';
    },
    fromDriver(value) {
        return bech32.encode('atone', value);
    },
    toDriver(value: string) {
        return bech32.decode(value).words;
    },
});

export const Sha256Composite = customType<{ data: string; driverData: number[] }>({
    dataType() {
        return 'smallint[]';
    },
    fromDriver(value) {
        return uint8ArrayToHex(value);
    },
    toDriver(value: string) {
        return hexToUint8Array(value);
    },
});

export const FeedTable = pgTable('feed', {
    hash: Sha256Composite().primaryKey(), // Plain string
    author: AddressComposite().notNull(), // Bech32 String -> Uint8Array
    timestamp: timestamp({ withTimezone: true }).notNull(), // JS Date -> TimestampZ
    message: varchar({ length: MEMO_LENGTH }).notNull(), // Plaintext from memo dither.Post("Hello world")
});

export const ReplyTable = pgTable('replies', {
    hash: Sha256Composite().primaryKey(), // binary
    post_hash: Sha256Composite().notNull(), // SHA256 String -> uint8Array
    author: AddressComposite().notNull(), // Bech32 String -> Uint8Array
    timestamp: timestamp({ withTimezone: true }).notNull(), // JS Date -> TimestampZ
    message: varchar({ length: MEMO_LENGTH }).notNull(), // Plaintext from memo dither.Post("Hello world")
});

export const LikesTable = pgTable('likes', {
    hash: Sha256Composite().primaryKey(),
    data: AuthorComposite().default([]),
});

export const DislikesTable = pgTable('dislikes', {
    hash: Sha256Composite().primaryKey(),
    data: AuthorComposite().default([]),
});

export const FlagsTable = pgTable('flags', {
    hash: Sha256Composite().primaryKey(),
    data: AuthorComposite().default([]),
});

export const UsersTable = pgTable('users', {
    address: AddressComposite().primaryKey(),
    followers: AuthorComposite().default([]),
    following: AuthorComposite().default([]),
});
