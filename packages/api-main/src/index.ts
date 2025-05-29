import { Gets, Posts } from '@atomone/dither-api-types';
import { cors } from '@elysiajs/cors';
import node from '@elysiajs/node';
import { Elysia, t } from 'elysia';

import * as GetRequests from './gets/index';
import * as PostRequests from './posts/index';
import { verifyJWT } from './shared/jwt';
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
    app.get('/search', ({ query }) => GetRequests.Search(query), { query: Gets.SearchQuery });
    app.get('/user-replies', ({ query }) => GetRequests.UserReplies(query), { query: Gets.UserRepliesQuery });
    app.get('/following-posts', ({ query }) => GetRequests.FollowingPosts(query), { query: Gets.PostsQuery });
    app.get('/last-block', GetRequests.LastBlock);

    app.post('/auth', ({ body }) => PostRequests.Auth(body), { body: Posts.AuthBody });
    app.post('/auth-create', ({ body }) => PostRequests.AuthCreate(body), { body: Posts.AuthCreateBody });
    // Protected route group
    app.group('', group =>
        group
            .onBeforeHandle(verifyJWT)
            .get('/notifications', ({ query, store }) => GetRequests.Notifications(query, store), {
                query: Gets.NotificationsQuery,
            }),
    );

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

    // Protected route group
    app.group('', group =>
        group
            .onBeforeHandle(verifyJWT)
            .post('/mod/post-remove', ({ body, store }) => PostRequests.ModRemovePost(body, store), {
                body: Posts.ModRemovePostBody,
            })
            .post('/mod/post-restore', ({ body, store }) => PostRequests.ModRestorePost(body, store), {
                body: Posts.ModRemovePostBody,
            })
            .post('/mod/ban', ({ body, store }) => PostRequests.ModBan(body, store), {
                body: Posts.ModBanBody,
            })
            .post('/mod/unban', ({ body, store }) => PostRequests.ModUnban(body, store), {
                body: Posts.ModBanBody,
            })
            .get('/notification-read', ({ query, store }) => GetRequests.ReadNotification(query, store), {
                query: Gets.ReadNotificationQuery,
            }),
    );
    app.listen(config.WRITE_ONLY_PORT ?? 3001);
    console.log(`[API Write Only] Running on ${config.WRITE_ONLY_PORT ?? 3001}`);
}

function start() {
    startReadOnlyServer();
    startWriteOnlyServer();
}

start();
