import { Gets } from '@atomone/dither-api-types';
import { Elysia } from 'elysia';

import * as GetRequests from '../gets/index';

/**
 * Public routes that don't require authentication
 */
export const publicRoutes = new Elysia()
  .get('/health', GetRequests.health)
  .get('/dislikes', ({ query }) => GetRequests.Dislikes(query), { query: Gets.DislikesQuerySchema })
  .get('/feed', ({ query }) => GetRequests.Feed(query), { query: Gets.FeedQuerySchema })
  .get('/flags', ({ query }) => GetRequests.Flags(query), { query: Gets.FlagsQuerySchema })
  .get('/is-following', ({ query }) => GetRequests.IsFollowing(query), { query: Gets.IsFollowingQuerySchema })
  .get('/followers', ({ query }) => GetRequests.Followers(query), { query: Gets.FollowersQuerySchema })
  .get('/following', ({ query }) => GetRequests.Following(query), { query: Gets.FollowingQuerySchema })
  .get('/likes', ({ query }) => GetRequests.Likes(query), { query: Gets.LikesQuerySchema })
  .get('/posts', ({ query }) => GetRequests.Posts(query), { query: Gets.PostsQuerySchema })
  .get('/post', ({ query }) => GetRequests.Post(query), { query: Gets.PostQuerySchema })
  .get('/replies', ({ query }) => GetRequests.Replies(query), { query: Gets.RepliesQuerySchema })
  .get('/search', ({ query }) => GetRequests.Search(query), { query: Gets.SearchQuerySchema })
  .get('/user-replies', ({ query }) => GetRequests.UserReplies(query), { query: Gets.UserRepliesQuerySchema })
  .get('/following-posts', ({ query }) => GetRequests.FollowingPosts(query), { query: Gets.PostsQuerySchema })
  .get('/last-block', GetRequests.LastBlock);
