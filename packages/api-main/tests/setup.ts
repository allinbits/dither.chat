import type { TestProject } from 'vitest/node';

import { sql } from 'drizzle-orm';

import { getDatabase } from '../drizzle/db';
import { tables } from '../drizzle/schema';
import { start } from '../src/index';

async function clearTables() {
    console.log('Clearing Tables');
    try {
        for (const tableName of tables) {
            await getDatabase().execute(sql`TRUNCATE TABLE ${sql.raw(tableName)};`);
        }
    }
    catch (err) {
        console.error('Error clearing tables:', err);
        // Continue anyway - tables might not exist yet
    }
}

export async function setup(project: TestProject) {
    start();

    // Give server time to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    project.onTestsRerun(clearTables);
    await clearTables();
}
