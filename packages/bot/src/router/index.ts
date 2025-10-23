import { createRouter, createWebHistory } from "vue-router";
import IndexPage from "~/pages/IndexPage.vue";
import FeedPage from "~/pages/FeedPage.vue";
import SearchPage from "~/pages/SearchPage.vue";
import UserPage from "~/pages/UserPage.vue";
import TonConnectPage from "~/pages/TonConnectPage.vue";
import InitDataPage from "~/pages/InitDataPage.vue";
import ThemeParamsPage from "~/pages/ThemeParamsPage.vue";
import LaunchParamsPage from "~/pages/LaunchParamsPage.vue";

export const routes = [
  {
    path: "/",
    name: "index",
    component: IndexPage,
  },
  {
    path: "/feed",
    name: "feed",
    component: FeedPage,
  },
  {
    path: "/search",
    name: "search",
    component: SearchPage,
  },
  {
    path: "/user/:address",
    name: "user",
    component: UserPage,
  },
  {
    path: "/post/:hash",
    name: "post",
    component: UserPage, // TODO: Create PostPage component
  },
  {
    path: "/ton-connect",
    name: "ton-connect",
    component: TonConnectPage,
  },
  {
    path: "/init-data",
    name: "init-data",
    component: InitDataPage,
  },
  {
    path: "/theme-params",
    name: "theme-params",
    component: ThemeParamsPage,
  },
  {
    path: "/launch-params",
    name: "launch-params",
    component: LaunchParamsPage,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
