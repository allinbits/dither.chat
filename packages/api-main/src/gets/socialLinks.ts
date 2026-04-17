import type { Gets } from '@atomone/dither-api-types';

import { and, eq } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { SocialLinksTable } from '../../drizzle/schema';
import { verifyJWT } from '../shared/jwt';
import { SOCIAL_LINK_STATUS } from '../types/social-link';

/**
 * GET /social/links?address=...
 *
 * Public callers (no auth): returns only verified links.
 * Owner (valid JWT cookie matching the requested address): returns all links
 */
export async function SocialLinks(query: Gets.SocialLinksQuery, authToken: string | undefined) {
  if (!query.address || query.address.length !== 44) {
    return { status: 400, error: 'Valid address is required' };
  }

  const address = query.address.toLowerCase();

  // Determine if the caller is the owner of this address
  let isOwner = false;
  if (authToken) {
    const tokenAddress = await verifyJWT(authToken);
    if (tokenAddress && tokenAddress.toLowerCase() === address) {
      isOwner = true;
    }
  }

  try {
    if (isOwner) {
      // Owner: all statuses, include error_reason
      const rows = await getDatabase()
        .select({
          id: SocialLinksTable.id,
          handle: SocialLinksTable.handle,
          platform: SocialLinksTable.platform,
          status: SocialLinksTable.status,
          error_reason: SocialLinksTable.error_reason,
          proof_url: SocialLinksTable.proof_url,
          created_at: SocialLinksTable.created_at,
        })
        .from(SocialLinksTable)
        .where(eq(SocialLinksTable.address, address))
        .orderBy(SocialLinksTable.created_at);

      return { status: 200, rows };
    } else {
      // Public: verified only, no error_reason
      const rows = await getDatabase()
        .select({
          id: SocialLinksTable.id,
          handle: SocialLinksTable.handle,
          platform: SocialLinksTable.platform,
          status: SocialLinksTable.status,
          created_at: SocialLinksTable.created_at,
        })
        .from(SocialLinksTable)
        .where(
          and(
            eq(SocialLinksTable.address, address),
            eq(SocialLinksTable.status, SOCIAL_LINK_STATUS.VERIFIED),
          ),
        )
        .orderBy(SocialLinksTable.created_at);

      return { status: 200, rows };
    }
  } catch (err) {
    console.error(err);
    return { status: 400, error: 'failed to read data from database' };
  }
}
