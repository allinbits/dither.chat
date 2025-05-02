import { Elysia } from 'elysia';
import node from '@elysiajs/node';
import { cors } from '@elysiajs/cors';
import { useConfig } from './config';

import * as GetRequests from './gets/index';
import * as PostRequests from './posts/index';

const config = useConfig();

function startReadOnlyServer() {
    const app = new Elysia({ adapter: node(), prefix: '/v1' });
    app.use(cors());
    app.get('/dislikes', ({ query }) => GetRequests.Dislikes(query), { query: GetRequests.DislikesQuery });
    app.get('/feed', ({ query }) => GetRequests.Feed(query), { query: GetRequests.FeedQuery });
    app.get('/flags', ({ query }) => GetRequests.Flags(query), { query: GetRequests.FlagsQuery });
    app.get('/followers', ({ query }) => GetRequests.Followers(query), { query: GetRequests.FollowersQuery });
    app.get('/following', ({ query }) => GetRequests.Following(query), { query: GetRequests.FollowingQuery });
    app.get('/health', GetRequests.health);
    app.get('/likes', ({ query }) => GetRequests.Likes(query), { query: GetRequests.LikesQuery });
    app.get('/posts', ({ query }) => GetRequests.Posts(query), { query: GetRequests.PostsQuery });
    app.get('/replies', ({ query }) => GetRequests.Replies(query), { query: GetRequests.RepliesQuery });
    app.listen(config.READ_ONLY_PORT ?? 3000);
    console.log(`[API Read Only] Running on ${config.READ_ONLY_PORT ?? 3000}`);
}

function startWriteOnlyServer() {
    const app = new Elysia({ adapter: node(), prefix: '/v1' });
    app.use(cors());

    app.get('/health', GetRequests.health);
    app.post('/post', ({ body }) => PostRequests.Post(body), { body: PostRequests.PostBody });
    app.post('/reply', ({ body }) => PostRequests.Reply(body), { body: PostRequests.ReplyBody });
    app.post('/follow', ({ body }) => PostRequests.Follow(body), { body: PostRequests.FollowBody });
    app.post('/unfollow', ({ body }) => PostRequests.Unfollow(body), { body: PostRequests.UnfollowBody });
    app.post('/like', ({ body }) => PostRequests.Like(body), { body: PostRequests.LikeBody });
    app.post('/dislike', ({ body }) => PostRequests.Dislike(body), { body: PostRequests.DislikeBody });
    app.post('/flag', ({ body }) => PostRequests.Flag(body), { body: PostRequests.FlagBody });
    app.post('/post-remove', ({ body }) => PostRequests.PostRemove(body), { body: PostRequests.PostRemoveBody });

    app.listen(config.WRITE_ONLY_PORT ?? 3001);
    console.log(`[API Write Only] Running on ${config.WRITE_ONLY_PORT ?? 3001}`);
}

function start() {
    startReadOnlyServer();
    startWriteOnlyServer();
}

start();
