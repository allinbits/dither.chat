import type { FeedConfig } from '../types';

import builtInFeeds, { internalFeeds, sharedFeeds } from './builtins';

export const Feed = {
  Global: 'global',
  Following: 'following',
} as const;

export type FeedSlug = (typeof Feed)[keyof typeof Feed];

export function isInternalFeed(slug: string): slug is FeedSlug {
  return internalFeeds.some(f => f.slug === slug);
}

export function isBuiltInFeed(slug: string): boolean {
  return builtInFeeds.some(f => f.slug === slug);
}

export function getFeedConfig(slug: string): FeedConfig | undefined {
  return builtInFeeds.find(f => f.slug === slug);
}

export function getSharedFeeds(): FeedConfig[] {
  return sharedFeeds;
}
