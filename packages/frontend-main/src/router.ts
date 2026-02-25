import { createRouter, createWebHistory } from 'vue-router';

import { useWalletStateStore } from './stores/useWalletStateStore';
import AboutView from './views/AboutView.vue';
import AccountView from './views/AccountView.vue';
import EnvConfigView from './views/EnvConfigView.vue';
import HomeFeedView from './views/Home/HomeFeedView.vue';
import HomeFollowingView from './views/Home/HomeFollowingView.vue';
import ManageFollowingView from './views/ManageFollowingView.vue';
import NotFoundView from './views/NotFoundView.vue';
import NotificationsView from './views/NotificationsView.vue';
import PostView from './views/PostView.vue';
import ProfilePostsView from './views/Profile/ProfilePostsView.vue';
import ProfileRepliesView from './views/Profile/ProfileRepliesView.vue';
import SettingsDefaultAmount from './views/SettingsDefaultAmount.vue';
import SettingsSingleSession from './views/SettingsSingleSession.vue';
import SettingsView from './views/SettingsView.vue';
import UnauthorizedView from './views/UnauthorizedView.vue';

export const routesNames = {
  home: 'Home',
  homeFollowing: 'Home Following',
  notifications: 'Notifications',
  profile: 'Profile',
  profileReplies: 'Profile Replies',
  settings: 'Settings',
  settingsAccount: 'Settings Account',
  settingsManageFollowers: 'Settings Manage Followers',
  settingsConfig: 'Settings Config',
  settingsSingleSession: 'Settings Single Session',
  settingsDefaultAmount: 'Settings Default Amount',
  post: 'Post',
  unauthorized: 'Unauthorized',
  notFound: 'NotFound',
  about: 'Anout',
};

const routes = [
  { path: '/', name: routesNames.home, component: HomeFeedView },
  { path: '/following', name: routesNames.homeFollowing, component: HomeFollowingView, meta: { authRequired: true } },
  { path: '/notifications', name: routesNames.notifications, component: NotificationsView, meta: { authRequired: true } },
  { path: '/profile/:address', name: routesNames.profile, component: ProfilePostsView },
  { path: '/profile/:address/replies', name: routesNames.profileReplies, component: ProfileRepliesView },
  { path: '/settings', name: routesNames.settings, component: SettingsView, meta: { authRequired: true } },
  { path: '/settings/account', name: routesNames.settingsAccount, component: AccountView, meta: { authRequired: true } },
  { path: '/settings/manage-following', name: routesNames.settingsManageFollowers, component: ManageFollowingView, meta: { authRequired: true } },
  { path: '/settings/env-config', name: routesNames.settingsConfig, component: EnvConfigView, meta: { authRequired: true } },
  { path: '/settings/settings-single-session', name: routesNames.settingsSingleSession, component: SettingsSingleSession, meta: { authRequired: true } },
  { path: '/settings/default-amount', name: routesNames.settingsDefaultAmount, component: SettingsDefaultAmount, meta: { authRequired: true } },
  { path: '/post/:hash/:postHash?', name: routesNames.post, component: PostView },
  { path: '/about', name: routesNames.about, component: AboutView },
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
    } else if ( // If navigating to the home/following pages → Keep the current scroll position
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
  } else {
    next();
  }
});

export default router;
