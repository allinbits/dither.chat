import { t } from 'elysia';
import { FlagsTable } from '../../drizzle/schema';
import { db } from '../../drizzle/db';
import { eq } from 'drizzle-orm';
import { getJsonbArrayCount } from '../utility';

export const FlagsQuery = t.Object({
    hash: t.String(),
    count: t.Optional(t.Boolean()),
});

export async function Flags(query: typeof FlagsQuery.static) {
    try {
        if (query.count) {
            return await getJsonbArrayCount(query.hash, FlagsTable._.name);
        }

        return await db.select().from(FlagsTable).where(eq(FlagsTable.hash, query.hash));
    } catch (error) {
        console.error(error);
        return { status: 400, error: 'failed to read data from database' };
    }
}
