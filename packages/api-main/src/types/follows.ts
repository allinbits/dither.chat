import type { GetColumnData } from 'drizzle-orm';
import type { FollowsTable } from '../../drizzle/schema';

export type FollowUser = {
    address: GetColumnData<typeof FollowsTable.following, 'query'>;
    // hash: GetColumnData<typeof FollowsTable.hash, 'query'>;
};
