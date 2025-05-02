import { createApp } from 'vue';
import './style.css';
import router from './router.ts';
import { createI18n } from "vue-i18n";
import { messages } from "@/localization";
import App from './App.vue';

const app = createApp(App);
const i18n = createI18n({
    legacy: false,
    locale: "en",
    fallbackLocale: "en",
    messages,
  });
app.use(i18n);
app.use(router);
app.mount('#app');