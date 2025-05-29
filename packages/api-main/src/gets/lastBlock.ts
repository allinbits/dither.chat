import { eq } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { ReaderState } from '../../drizzle/schema';

const statement = getDatabase()
    .select()
    .from(ReaderState)
    .where(eq(ReaderState.id, 0))
    .limit(1)
    .prepare('stmnt_get_state');

export async function LastBlock() {
    try {
        const [state] = await statement.execute();
        if (!state) {
            return { status: 404, rows: [] };
        }

        return { status: 200, rows: [state] };
    }
    catch (error) {
        console.error(error);
        return { error: 'failed to read data from database' };
    }
}
