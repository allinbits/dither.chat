import { Gets, Posts } from '@atomone/dither-api-types';
import { cors } from '@elysiajs/cors';
import node from '@elysiajs/node';
import { Elysia, t } from 'elysia';

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
    app.get('/is-following', ({ query }) => GetRequests.IsFollowing(query), { query: Gets.IsFollowingQuery });
    app.get('/followers', ({ query }) => GetRequests.Followers(query), { query: Gets.FollowersQuery });
    app.get('/following', ({ query }) => GetRequests.Following(query), { query: Gets.FollowingQuery });
    app.get('/health', GetRequests.health);
    app.get('/likes', ({ query }) => GetRequests.Likes(query), { query: Gets.LikesQuery });
    app.get('/posts', ({ query }) => GetRequests.Posts(query), { query: Gets.PostsQuery });
    app.get('/post', ({ query }) => GetRequests.Post(query), { query: Gets.PostQuery });
    app.get('/replies', ({ query }) => GetRequests.Replies(query), { query: Gets.RepliesQuery });
    app.get('/search', ({ query }) => GetRequests.Search(query), { query: Gets.SearchQuery });
    app.get('/user-replies', ({ query }) => GetRequests.UserReplies(query), { query: Gets.UserRepliesQuery });
    app.get('/following-posts', ({ query }) => GetRequests.FollowingPosts(query), { query: Gets.PostsQuery });
    app.get('/last-block', GetRequests.LastBlock);
    app.get('/auth-verify', ({ cookie: { auth } }) => GetRequests.AuthVerify(auth));

    app.post('/auth', ({ body, cookie: { auth } }) => PostRequests.Auth(body, auth), { body: t.Object({
        id: t.Number(),
        pub_key: t.Object({ type: t.String(), value: t.String() }),
        signature: t.String(),
        json: t.Optional(t.Boolean()),
    }) });
    app.post('/auth-create', ({ body }) => PostRequests.AuthCreate(body), { body: Posts.AuthCreateBody });
    // Protected route group
    app.get('/notifications', ({ query, cookie: { auth } }) => GetRequests.Notifications(query, auth), {
        query: Gets.NotificationsQuery,
    });

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
    app.post('/update-state', ({ body }) => PostRequests.UpdateState(body), { body: t.Object({ last_block: t.String() }) });
    app.get('/last-block', GetRequests.LastBlock);
    app.post('/mod/post-remove', ({ body, cookie: { auth } }) => PostRequests.ModRemovePost(body, auth), {
        body: Posts.ModRemovePostBody,
    });
    app.post('/mod/post-restore', ({ body, cookie: { auth } }) => PostRequests.ModRestorePost(body, auth), {
        body: Posts.ModRemovePostBody,
    });
    app.post('/mod/ban', ({ body, cookie: { auth } }) => PostRequests.ModBan(body, auth), {
        body: Posts.ModBanBody,
    });
    app.post('/mod/unban', ({ body, cookie: { auth } }) => PostRequests.ModUnban(body, auth), {
        body: Posts.ModBanBody,
    });
    app.get('/notification-read', ({ query, cookie: { auth } }) => GetRequests.ReadNotification(query, auth), {
        query: Gets.ReadNotificationQuery,
    });

    app.listen(config.WRITE_ONLY_PORT ?? 3001);
    console.log(`[API Write Only] Running on ${config.WRITE_ONLY_PORT ?? 3001}`);
}

function start() {
    startReadOnlyServer();
    startWriteOnlyServer();
}

start();
