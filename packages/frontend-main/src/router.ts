import { createRouter, createWebHistory } from 'vue-router';

import HomeView from './views/HomeView.vue';
import NotificationsView from './views/NotificationsView.vue';
import ProfileView from './views/ProfileView.vue';

const routes = [
    { path: '/', component: HomeView },
    { path: '/notifications', component: NotificationsView },
    { path: '/profile/:address', component: ProfileView },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
