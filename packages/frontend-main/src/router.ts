import { createRouter, createWebHistory } from 'vue-router';

import { useWalletStateStore } from './stores/useWalletStateStore';
import HomeView from './views/HomeView.vue';
import NotFoundView from './views/NotFoundView.vue';
import NotificationsView from './views/NotificationsView.vue';
import PostView from './views/PostView.vue';
import ProfileView from './views/ProfileView.vue';
import UnauthorizedView from './views/UnauthorizedView.vue';

const routes = [
    { path: '/', component: HomeView },
    { path: '/notifications', component: NotificationsView, meta: { authRequired: true } },
    { path: '/profile/:address', component: ProfileView },
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
    // FIXME: should handle the auth state base on JWT instead wallet connected
    const walletState = useWalletStateStore();
    const isAuthenticated = walletState.loggedIn;

    // If the route is auth required and the user is not authenticated, redirect to the unauthorized page
    if (to.meta.authRequired && !isAuthenticated) {
        next({ name: 'Unauthorized' });
    }
    else {
        next();
    }
});

export default router;
