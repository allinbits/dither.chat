import type { Cookie } from 'elysia';

import { getDatabase } from '../../drizzle/db';
import { CustomFeedsTable } from '../../drizzle/schema';
import { Feed, service as FeedService, getSharedFeeds } from '../feed';

interface FeedExecuteQuery {
  limit?: string | number;
  offset?: string | number;
  minQuantity?: string;
  address?: string;
}

interface FeedExecuteContext {
  query: FeedExecuteQuery;
  cookie: { auth?: Cookie<string | undefined> };
}

interface FeedSlugContext extends FeedExecuteContext {
  params: { slug: string };
}

export async function GlobalFeed({ query }: { query: FeedExecuteQuery }) {
  return FeedService.execute(Feed.Global, undefined, {
    limit: query.limit ? Number(query.limit) : undefined,
    offset: query.offset ? Number(query.offset) : undefined,
    minQuantity: query.minQuantity,
  });
}

export async function FeedBySlug({ params: { slug }, query }: FeedSlugContext) {
  const address = query.address;
  return FeedService.execute(slug, address ? { address } : undefined, {
    limit: query.limit ? Number(query.limit) : undefined,
    offset: query.offset ? Number(query.offset) : undefined,
    minQuantity: query.minQuantity,
  });
}

export async function FollowingFeed({ query }: FeedExecuteContext) {
  const address = query.address;
  return FeedService.execute(Feed.Following, address ? { address } : undefined, {
    limit: query.limit ? Number(query.limit) : undefined,
    offset: query.offset ? Number(query.offset) : undefined,
    minQuantity: query.minQuantity,
  });
}

export async function ListFeeds() {
  const db = getDatabase();
  const customFeeds = await db
    .select({
      slug: CustomFeedsTable.slug,
      name: CustomFeedsTable.name,
      description: CustomFeedsTable.description,
      author: CustomFeedsTable.author,
    })
    .from(CustomFeedsTable);

  const shared = getSharedFeeds().map(f => ({
    slug: f.slug,
    name: f.name,
    description: f.description,
    author: null as string | null,
  }));

  return [...shared, ...customFeeds];
}
