import { Gets } from '@atomone/dither-api-types';
import { Elysia } from 'elysia';

import * as GetRequests from '../gets/index';

/**
 * Public routes that don't require authentication
 */
export const publicRoutes = new Elysia()
  .get('/health', GetRequests.health)
  .get('/dislikes', ({ query }) => GetRequests.Dislikes(query), { query: Gets.DislikesQuery })
  .get('/feed', ({ query }) => GetRequests.Feed(query), { query: Gets.FeedQuery })
  .get('/flags', ({ query }) => GetRequests.Flags(query), { query: Gets.FlagsQuery })
  .get('/is-following', ({ query }) => GetRequests.IsFollowing(query), { query: Gets.IsFollowingQuery })
  .get('/followers', ({ query }) => GetRequests.Followers(query), { query: Gets.FollowersQuery })
  .get('/following', ({ query }) => GetRequests.Following(query), { query: Gets.FollowingQuery })
  .get('/likes', ({ query }) => GetRequests.Likes(query), { query: Gets.LikesQuery })
  .get('/posts', ({ query }) => GetRequests.Posts(query), { query: Gets.PostsQuery })
  .get('/post', ({ query }) => GetRequests.Post(query), { query: Gets.PostQuery })
  .get('/replies', ({ query }) => GetRequests.Replies(query), { query: Gets.RepliesQuery })
  .get('/search', ({ query }) => GetRequests.Search(query), { query: Gets.SearchQuery })
  .get('/user-replies', ({ query }) => GetRequests.UserReplies(query), { query: Gets.UserRepliesQuery })
  .get('/following-posts', ({ query }) => GetRequests.FollowingPosts(query), { query: Gets.PostsQuery })
  .get('/last-block', GetRequests.LastBlock);
