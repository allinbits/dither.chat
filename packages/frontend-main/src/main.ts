import { VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';

import { messages } from '@/localization';

import App from './App.vue';
import Icon from './components/ui/icon/Icon.vue';
import router from './router.ts';

import './style.css';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
const app = createApp(App);
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
  pluralRules: {
    en: (choice) => {
      return choice === 0 || choice === 1 ? 0 : 1;
    },
  },
});
app.use(i18n);
app.use(pinia);
app.use(router);
app.use(VueQueryPlugin);
app.component('Icon', Icon);
app.mount('#app');
