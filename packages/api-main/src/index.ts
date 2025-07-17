import { Gets, Posts } from '@atomone/dither-api-types';
import { cors } from '@elysiajs/cors';
import node from '@elysiajs/node';
import { Elysia, t } from 'elysia';

import * as GetRequests from './gets/index';
import * as PostRequests from './posts/index';
import { useConfig } from './config';

const config = useConfig();
const app = new Elysia({ adapter: node(), prefix: '/v1' });

export function start() {
    app.use(cors());
    app.get('/health', GetRequests.health);
    app.get('/dislikes', ({ query }) => GetRequests.Dislikes(query), { query: Gets.DislikesQuery });
    app.get('/feed', ({ query }) => GetRequests.Feed(query), { query: Gets.FeedQuery });
    app.get('/flags', ({ query }) => GetRequests.Flags(query), { query: Gets.FlagsQuery });
    app.get('/is-following', ({ query }) => GetRequests.IsFollowing(query), { query: Gets.IsFollowingQuery });
    app.get('/followers', ({ query }) => GetRequests.Followers(query), { query: Gets.FollowersQuery });
    app.get('/following', ({ query }) => GetRequests.Following(query), { query: Gets.FollowingQuery });
    app.get('/likes', ({ query }) => GetRequests.Likes(query), { query: Gets.LikesQuery });
    app.get('/posts', ({ query }) => GetRequests.Posts(query), { query: Gets.PostsQuery });
    app.get('/post', ({ query }) => GetRequests.Post(query), { query: Gets.PostQuery });
    app.get('/replies', ({ query }) => GetRequests.Replies(query), { query: Gets.RepliesQuery });
    app.get('/search', ({ query }) => GetRequests.Search(query), { query: Gets.SearchQuery });
    app.get('/user-replies', ({ query }) => GetRequests.UserReplies(query), { query: Gets.UserRepliesQuery });
    app.get('/following-posts', ({ query }) => GetRequests.FollowingPosts(query), { query: Gets.PostsQuery });
    app.get('/last-block', GetRequests.LastBlock);
    app.get('/auth-verify', ({ cookie: { auth } }) => GetRequests.AuthVerify(auth));
    app.get('/last-block', GetRequests.LastBlock);
    app.get('/notifications', ({ query, cookie: { auth } }) => GetRequests.Notifications(query, auth), {
        query: Gets.NotificationsQuery,
    });
    app.get('/notifications-count', ({ query, cookie: { auth } }) => GetRequests.NotificationsCount(query, auth), {
        query: Gets.NotificationsCountQuery,
    });
    app.get('/notification-read', ({ query, cookie: { auth } }) => GetRequests.ReadNotification(query, auth), {
        query: Gets.ReadNotificationQuery,
    });
    app.get('/notification-read', ({ query, cookie: { auth } }) => GetRequests.ReadNotification(query, auth), {
        query: Gets.ReadNotificationQuery,
    });

    app.post('/auth-create', ({ body }) => PostRequests.AuthCreate(body), { body: Posts.AuthCreateBody });
    app.post('/auth', ({ body, cookie: { auth } }) => PostRequests.Auth(body, auth), { body: t.Object({
        id: t.Number(),
        pub_key: t.Object({ type: t.String(), value: t.String() }),
        signature: t.String(),
        json: t.Optional(t.Boolean()),
    }) });

    app.post('/post', ({ body, headers }) => PostRequests.Post(body, headers), { body: Posts.PostBody });
    app.post('/reply', ({ body, headers }) => PostRequests.Reply(body, headers), { body: Posts.ReplyBody });
    app.post('/follow', ({ body, headers }) => PostRequests.Follow(body, headers), { body: Posts.FollowBody });
    app.post('/unfollow', ({ body, headers }) => PostRequests.Unfollow(body, headers), { body: Posts.UnfollowBody });
    app.post('/like', ({ body, headers }) => PostRequests.Like(body, headers), { body: Posts.LikeBody });
    app.post('/dislike', ({ body, headers }) => PostRequests.Dislike(body, headers), { body: Posts.DislikeBody });
    app.post('/flag', ({ body, headers }) => PostRequests.Flag(body, headers), { body: Posts.FlagBody });
    app.post('/post-remove', ({ body, headers }) => PostRequests.PostRemove(body, headers), { body: Posts.PostRemoveBody });
    app.post('/update-state', ({ body, headers }) => PostRequests.UpdateState(body, headers), { body: t.Object({ last_block: t.String() }) });
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

    app.listen(config.PORT);
}

export function stop() {
    app.stop(true);
}

if (!process.env.SKIP_START) {
    start();
}
