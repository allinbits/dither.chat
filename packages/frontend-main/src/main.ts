import './style.css';

import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import { VueQueryPlugin } from '@tanstack/vue-query';

import App from './App.vue';
import router from './router.ts';

import IconVue from '@/components/ui/Icon.vue';
import { messages } from '@/localization';

const app = createApp(App);
const i18n = createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    messages,
});
app.use(i18n);
app.use(router);
app.use(VueQueryPlugin);
app.component('Icon', IconVue);
app.mount('#app');
