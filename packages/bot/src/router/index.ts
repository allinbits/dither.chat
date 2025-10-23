import { createRouter, createWebHistory } from "vue-router";
import IndexPage from "@/pages/IndexPage.vue";

export const routes = [
  {
    path: "/",
    name: "index",
    component: IndexPage,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
