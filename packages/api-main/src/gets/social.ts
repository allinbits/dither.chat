import { and, eq, inArray } from 'drizzle-orm';

import { getDatabase } from '../../drizzle/db';
import { SocialLinksTable } from '../../drizzle/schema';
import { SOCIAL_LINK_STATUS } from '../types/social-link';

export type SocialByAddress = Record<string, typeof SocialLinksTable.$inferSelect[]>;

/**
 * Fetch verified social links for a list of addresses.
 * Returns a Record keyed by address. Only includes addresses that have at least one verified link.
 * Returns an empty object if addresses is empty.
 */
export async function fetchSocialByAddresses(addresses: string[]): Promise<SocialByAddress> {
  if (addresses.length === 0) return {};

  const unique = [...new Set(addresses)];

  const links = await getDatabase()
    .select()
    .from(SocialLinksTable)
    .where(
      and(
        inArray(SocialLinksTable.address, unique),
        eq(SocialLinksTable.status, SOCIAL_LINK_STATUS.VERIFIED),
      ),
    );

  const result: SocialByAddress = {};
  for (const link of links) {
    if (!result[link.address]) result[link.address] = [];
    result[link.address].push(link);
  }
  return result;
}
