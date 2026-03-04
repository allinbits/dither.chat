import type { Gets } from '@atomone/dither-api-types';

import { and, desc, eq, sql } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { SocialLinksTable } from '../../drizzle/schema';
import { SOCIAL_LINK_STATUS } from '../types/social-link';

const statementGetSocialResolve = getDatabase()
  .select({
    address: SocialLinksTable.address,
    handle: SocialLinksTable.handle,
    platform: SocialLinksTable.platform,
    created_at: SocialLinksTable.created_at,
  })
  .from(SocialLinksTable)
  .where(
    and(
      eq(SocialLinksTable.handle, sql.placeholder('handle')),
      eq(SocialLinksTable.status, SOCIAL_LINK_STATUS.VERIFIED),
    ),
  )
  .orderBy(desc(SocialLinksTable.created_at))
  .limit(1)
  .prepare('stmnt_get_social_resolve');

/**
 * GET /social/resolve?handle=alice@x
 *
 * Returns the wallet address associated with a verified social handle.
 * Returns 404 if no verified link is found for the handle.
 * If multiple verified entries exist (re-verification history), returns the most recent.
 */
export async function SocialResolve(query: Gets.SocialResolveQuery) {
  if (!query.handle || !query.handle.includes('@')) {
    return { status: 400, error: 'Valid handle in format "username@platform" is required' };
  }

  const handle = query.handle.toLowerCase();

  try {
    const [row] = await statementGetSocialResolve.execute({ handle });

    if (!row) {
      return { status: 404, error: 'No verified link found for this handle' };
    }

    return { status: 200, address: row.address, handle: row.handle, platform: row.platform };
  } catch (err) {
    console.error(err);
    return { status: 400, error: 'failed to read data from database' };
  }
}
