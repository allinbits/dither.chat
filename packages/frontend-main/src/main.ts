import './style.css';

import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import Icon from './components/ui/icon/Icon.vue';
import App from './App.vue';
import router from './router.ts';

import { messages } from '@/localization';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
const app = createApp(App);
const i18n = createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    messages,
});
app.use(i18n);
app.use(pinia);
app.use(router);
app.use(VueQueryPlugin);
app.component('Icon', Icon);
app.mount('#app');
