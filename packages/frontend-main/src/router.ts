import { createRouter, createWebHistory } from 'vue-router';

import HomeView from './views/HomeView.vue';
import NotificationsView from './views/NotificationsView.vue';
import PostView from './views/PostView.vue';
import ProfileView from './views/ProfileView.vue';

const routes = [
    { path: '/', component: HomeView },
    { path: '/notifications', component: NotificationsView },
    { path: '/profile/:address', component: ProfileView },
    { path: '/post', component: PostView },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
