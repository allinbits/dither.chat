import type { TestProject } from 'vitest/node';

import { sql } from 'drizzle-orm';

import { getDatabase } from '../drizzle/db';
import { tables } from '../drizzle/schema';
import { start } from '../src/index';

async function clearTables() {
    console.log('Clearing Tables');
    for (const tableName of tables) {
        await getDatabase().execute(sql`TRUNCATE TABLE ${sql.raw(tableName)};`);
    }
}

export async function setup(project: TestProject) {
    try {
        stop();
    }
    catch (err) {
        console.log(err);
    }

    start();

    project.onTestsRerun(clearTables);
    await clearTables();
}
