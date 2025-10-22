import { createRouter, createWebHistory } from "vue-router";
import IndexPage from "@/pages/IndexPage.vue";
import InitDataPage from "@/pages/InitDataPage.vue";
import ThemeParamsPage from "@/pages/ThemeParamsPage.vue";
import LaunchParamsPage from "@/pages/LaunchParamsPage.vue";
import TonConnectPage from "@/pages/TonConnectPage.vue";
import FeedPage from "@/pages/FeedPage.vue";
import SearchPage from "@/pages/SearchPage.vue";
import UserPage from "@/pages/UserPage.vue";
import IconTonConnect from "@/components/IconTonConnect.vue";

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
    meta: {
      title: "📱 Feed",
    },
  },
  {
    path: "/search",
    name: "search",
    component: SearchPage,
    meta: {
      title: "🔍 Search",
    },
  },
  {
    path: "/user/:address",
    name: "user",
    component: UserPage,
    meta: {
      title: "👤 User",
    },
  },
  {
    path: "/init-data",
    name: "init-data",
    component: InitDataPage,
    meta: {
      title: "Init Data",
    },
  },
  {
    path: "/theme-params",
    name: "theme-params",
    component: ThemeParamsPage,
    meta: {
      title: "Theme Params",
    },
  },
  {
    path: "/launch-params",
    name: "launch-params",
    component: LaunchParamsPage,
    meta: {
      title: "Launch Params",
    },
  },
  {
    path: "/ton-connect",
    name: "ton-connect",
    component: TonConnectPage,
    meta: {
      icon: IconTonConnect,
      title: "TON Connect",
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
