import { createRouter, createWebHistory } from 'vue-router';

import { useWalletStateStore } from './stores/useWalletStateStore';
import EnvConfigView from './views/EnvConfigView.vue';
import ExploreView from './views/ExploreView.vue';
import HomeFeedView from './views/Home/HomeFeedView.vue';
import HomeFollowingView from './views/Home/HomeFollowingView.vue';
import ManageFollowingView from './views/ManageFollowingView.vue';
import NotFoundView from './views/NotFoundView.vue';
import NotificationsView from './views/NotificationsView.vue';
import PostView from './views/PostView.vue';
import ProfilePostsView from './views/Profile/ProfilePostsView.vue';
import ProfileRepliesView from './views/Profile/ProfileRepliesView.vue';
import SettingsView from './views/SettingsView.vue';
import UnauthorizedView from './views/UnauthorizedView.vue';

export const routesNames = {
    home: 'Home',
    homeFollowing: 'Home Following',
    explore: 'Explore',
    notifications: 'Notifications',
    profile: 'Profile',
    profileReplies: 'Profile Replies',
    settings: 'Settings',
    settingsManageFollowers: 'Settings Manage Followers',
    settingsConfig: 'Settings Config',
    post: 'Post',
    unauthorized: 'Unauthorized',
    notFound: 'NotFound',
};

const routes = [
    { path: '/', name: 'Home', component: HomeFeedView },
    { path: '/following', name: 'Home Following', component: HomeFollowingView, meta: { authRequired: true } },
    { path: '/explore', name: 'Explore', component: ExploreView },
    { path: '/notifications', name: 'Notifications', component: NotificationsView, meta: { authRequired: true } },
    { path: '/profile/:address', name: 'Profile', component: ProfilePostsView },
    { path: '/profile/:address/replies', name: 'Profile Replies', component: ProfileRepliesView },
    { path: '/settings', name: 'Settings', component: SettingsView, meta: { authRequired: true } },
    { path: '/settings/manage-following', name: 'Settings Manage Following', component: ManageFollowingView, meta: { authRequired: true } },
    { path: '/settings/env-config', name: 'Settings Config', component: EnvConfigView, meta: { authRequired: true } },
    { path: '/post/:hash/:postHash?', name: 'Post', component: PostView },
    {
        path: '/unauthorized',
        name: routesNames.unauthorized,
        component: UnauthorizedView,
    },
    // Catch-all route for 404
    {
        path: '/:pathMatch(.*)*',
        name: routesNames.notFound,
        component: NotFoundView,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, _, savedPosition) {
        // If this is a back/forward navigation (e.g. browser back button or router.go(-1)) → Restore he saved scroll position
        if (savedPosition) {
            return savedPosition;
        }
        // If navigating to the home/following pages → Keep the current scroll position
        else if (
            to.name === routesNames.home
            || to.name === routesNames.homeFollowing
        ) {
            return undefined;
        }
        // For any other route (e.g. navigating to `/post/:hash`) → Force scroll to the top of the page
        return { top: 0 };
    },
});

router.beforeEach((to, _, next) => {
    const walletState = useWalletStateStore();

    // If the route is auth required and the user is not authenticated, redirect to the unauthorized page
    if (to.meta.authRequired && !walletState.loggedIn) {
        next({ name: routesNames.unauthorized });
    }
    else {
        next();
    }
});

export default router;
