import type { FeedConfig } from '../types';

export const internalFeeds = [
  { slug: 'global', name: 'Global', query: 'sort=-timestamp' },
  { slug: 'following', name: 'Following', query: 'author[$in]=$following&sort=-timestamp&include[reposts]=true' },
] satisfies FeedConfig[];

export const sharedFeeds = [
  { slug: 'trending', name: 'Trending', description: 'Posts with the most likes in the last 2 days', query: 'timeframe=2d&likes[$gte]=1&sort=-likes' },
  { slug: 'popular', name: 'Popular', description: 'Posts that sparked conversations', query: 'replies[$gte]=1&sort=-timestamp' },
  { slug: 'gno', name: 'Gno', description: 'Posts about Gno.land', query: 'message[$search]=gno,gnot,gno.land&sort=-timestamp' },
  { slug: 'atone', name: 'AtomOne', description: 'Posts about AtomOne', query: 'message[$search]=atomone,atone&sort=-timestamp' },
] satisfies FeedConfig[];

export default [...internalFeeds, ...sharedFeeds] satisfies FeedConfig[];
