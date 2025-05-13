import { Gets, Posts } from '@atomone/dither-api-types';
import { cors } from '@elysiajs/cors';
import node from '@elysiajs/node';
import { Elysia } from 'elysia';

import * as GetRequests from './gets/index';
import * as PostRequests from './posts/index';
import { useConfig } from './config';

const config = useConfig();

function startReadOnlyServer() {
    const app = new Elysia({ adapter: node(), prefix: '/v1' });
    app.use(cors());
    app.get('/dislikes', ({ query }) => GetRequests.Dislikes(query), { query: Gets.DislikesQuery });
    app.get('/feed', ({ query }) => GetRequests.Feed(query), { query: Gets.FeedQuery });
    app.get('/flags', ({ query }) => GetRequests.Flags(query), { query: Gets.FlagsQuery });
    app.get('/followers', ({ query }) => GetRequests.Followers(query), { query: Gets.FollowersQuery });
    app.get('/following', ({ query }) => GetRequests.Following(query), { query: Gets.FollowingQuery });
    app.get('/health', GetRequests.health);
    app.get('/likes', ({ query }) => GetRequests.Likes(query), { query: Gets.LikesQuery });
    app.get('/posts', ({ query }) => GetRequests.Posts(query), { query: Gets.PostsQuery });
    app.get('/post', ({ query }) => GetRequests.Post(query), { query: Gets.PostQuery });
    app.get('/replies', ({ query }) => GetRequests.Replies(query), { query: Gets.RepliesQuery });

    app.post('/auth', ({ body }) => PostRequests.Auth(body), { body: Posts.AuthBody });
    app.post('/auth-create', ({ body }) => PostRequests.AuthCreate(body), { body: Posts.AuthCreateBody });

    app.listen(config.READ_ONLY_PORT ?? 3000);
    console.log(`[API Read Only] Running on ${config.READ_ONLY_PORT ?? 3000}`);
}

function startWriteOnlyServer() {
    const app = new Elysia({ adapter: node(), prefix: '/v1' });
    app.use(cors());

    app.get('/health', GetRequests.health);
    app.post('/post', ({ body }) => PostRequests.Post(body), { body: Posts.PostBody });
    app.post('/reply', ({ body }) => PostRequests.Reply(body), { body: Posts.ReplyBody });
    app.post('/follow', ({ body }) => PostRequests.Follow(body), { body: Posts.FollowBody });
    app.post('/unfollow', ({ body }) => PostRequests.Unfollow(body), { body: Posts.UnfollowBody });
    app.post('/like', ({ body }) => PostRequests.Like(body), { body: Posts.LikeBody });
    app.post('/dislike', ({ body }) => PostRequests.Dislike(body), { body: Posts.DislikeBody });
    app.post('/flag', ({ body }) => PostRequests.Flag(body), { body: Posts.FlagBody });
    app.post('/post-remove', ({ body }) => PostRequests.PostRemove(body), { body: Posts.PostRemoveBody });
    app.post('/mod/post-remove', ({ body }) => PostRequests.ModRemovePost(body), {
        body: Posts.ModRemovePostBody,
    });
    app.post('/mod/post-restore', ({ body }) => PostRequests.ModRestorePost(body), {
        body: Posts.ModRemovePostBody,
    });
    app.post('/mod/ban', ({ body }) => PostRequests.ModBan(body), {
        body: Posts.ModBanBody,
    });
    app.post('/mod/unban', ({ body }) => PostRequests.ModUnban(body), {
        body: Posts.ModBanBody,
    });

    app.listen(config.WRITE_ONLY_PORT ?? 3001);
    console.log(`[API Write Only] Running on ${config.WRITE_ONLY_PORT ?? 3001}`);
}

function start() {
    startReadOnlyServer();
    startWriteOnlyServer();
}

start();
