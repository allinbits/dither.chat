import { sql } from 'drizzle-orm';

import { getDatabase } from '../../../drizzle/db';
import { CustomFeedsTable } from '../../../drizzle/schema';
import { getFeedConfig } from '../config/feeds';

const statement = getDatabase()
  .select({ query: CustomFeedsTable.query })
  .from(CustomFeedsTable)
  .where(sql`${CustomFeedsTable.slug} = ${sql.placeholder('slug')}`)
  .limit(1)
  .prepare('stmnt_get_feed_query');

export async function retrieveFeedQuery(slug: string): Promise<string | undefined> {
  const builtIn = getFeedConfig(slug);
  if (builtIn) {
    return builtIn.query;
  }

  const results = await statement.execute({ slug });
  return results[0]?.query;
}
