import { createRouter, createWebHistory } from 'vue-router';

import { useWalletStateStore } from './stores/useWalletStateStore';
import EnvConfigView from './views/EnvConfigView.vue';
import ExploreView from './views/ExploreView.vue';
import HomeFeedView from './views/Home/HomeFeedView.vue';
import HomeFollowingView from './views/Home/HomeFollowingView.vue';
import ManageFollowsView from './views/ManageFollowsView.vue';
import NotFoundView from './views/NotFoundView.vue';
import NotificationsView from './views/NotificationsView.vue';
import PostView from './views/PostView.vue';
import ProfilePostsView from './views/Profile/ProfilePostsView.vue';
import ProfileRepliesView from './views/Profile/ProfileRepliesView.vue';
import SettingsView from './views/SettingsView.vue';
import UnauthorizedView from './views/UnauthorizedView.vue';

const routes = [
    { path: '/', component: HomeFeedView },
    { path: '/following', component: HomeFollowingView },
    { path: '/explore', name: 'Explore', component: ExploreView },
    { path: '/notifications', component: NotificationsView, meta: { authRequired: true } },
    { path: '/profile/:address', component: ProfilePostsView },
    { path: '/profile/:address/replies', component: ProfileRepliesView },
    { path: '/settings', component: SettingsView, meta: { authRequired: true } },
    { path: '/settings/manage-followers', component: ManageFollowsView, meta: { authRequired: true } },
    { path: '/settings/env-config', component: EnvConfigView, meta: { authRequired: true } },
    { path: '/post/:hash/:postHash?', component: PostView },
    {
        path: '/unauthorized',
        name: 'Unauthorized',
        component: UnauthorizedView,
    },
    // Catch-all route for 404
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFoundView,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, _, next) => {
    const walletState = useWalletStateStore();

    // If the route is auth required and the user is not authenticated, redirect to the unauthorized page
    if (to.meta.authRequired && !walletState.loggedIn) {
        next({ name: 'Unauthorized' });
    }
    else {
        next();
    }
});

export default router;
