<script setup lang="ts">
import type { RouteRecordNameGeneric } from 'vue-router';

import { Bell, Feather, HelpCircle, House, Rss, Settings, User } from 'lucide-vue-next';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import NotificationsCount from '@/components/notifications/NotificationsCount.vue';
import { useDefaultAmount } from '@/composables/useDefaultAmount';
import { usePopups } from '@/composables/usePopups';
import { useWallet } from '@/composables/useWallet';
import { routesNames } from '@/router';
import { cn } from '@/utility';

const wallet = useWallet();
const popups = usePopups();
const { isDefaultAmountInvalid } = useDefaultAmount();
const router = useRouter();
const isMyProfileRoute = computed(() => router.currentRoute.value.name?.toString().startsWith(routesNames.profile) && wallet.loggedIn.value && wallet.address.value === router.currentRoute.value.params.address);
const buttonClass = (routeName?: RouteRecordNameGeneric) => `flex justify-center items-center size-[52px] rounded-full active:bg-accent hover:bg-accent ${!!routeName && router.currentRoute.value.name?.toString().startsWith(routeName.toString()) && 'bg-accent/80'}`;
</script>

<template>
  <header class="h-full w-full flex flex-row items-center justify-around border-t bg-background px-4">
    <nav class="contents">
      <RouterLink to="/" :class="buttonClass(routesNames.home)">
        <House class="size-6" />
      </RouterLink>

      <RouterLink to="/feeds" :class="buttonClass(routesNames.feeds)">
        <Rss class="size-6" />
      </RouterLink>

      <RouterLink v-if="wallet.loggedIn.value" to="/notifications" :class="cn(buttonClass(routesNames.notifications), 'relative')">
        <NotificationsCount class="absolute top-1 left-6" />
        <Bell class="size-6" />
      </RouterLink>

      <RouterLink v-if="wallet.loggedIn.value" :to="`/profile/${wallet.address.value}`" :class="buttonClass(isMyProfileRoute ? routesNames.profile : undefined)">
        <User class="size-6" />
      </RouterLink>

      <RouterLink v-if="wallet.loggedIn.value" to="/settings" :class="buttonClass(routesNames.settings)">
        <Settings class="size-6" />
      </RouterLink>

      <RouterLink to="/about" :class="buttonClass(routesNames.about)">
        <HelpCircle class="size-6" />
      </RouterLink>
    </nav>

    <button v-if="wallet.loggedIn.value" :class="buttonClass()" @click="isDefaultAmountInvalid ? popups.show('invalidDefaultAmount', 'none') : popups.show('newPost', {})">
      <Feather class="size-6" />
    </button>
  </header>
</template>
