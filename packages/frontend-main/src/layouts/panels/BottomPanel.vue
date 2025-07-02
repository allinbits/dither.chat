<script setup lang="ts">
import { type RouteRecordNameGeneric, useRouter } from 'vue-router';
import { Bell, Feather, House, Search, Settings, User } from 'lucide-vue-next';

import { usePopups } from '@/composables/usePopups';
import { useWallet } from '@/composables/useWallet';

import NotificationsCount from '@/components/notifications/NotificationsCount.vue';
import { cn } from '@/utility';
const wallet = useWallet();
const popups = usePopups();
const router = useRouter();
const buttonClass = (routeName?: RouteRecordNameGeneric) => `flex justify-center items-center size-[52px] rounded-full active:bg-accent hover:bg-accent !transition-[background-color] ${!!routeName && router.currentRoute.value.name?.toString().startsWith(routeName.toString()) && 'bg-accent/80'}`;

</script>

<template>
  <header class="h-full w-full flex flex-row items-center justify-around px-4 border-t bg-background !transition-[background-color,border-color]">
    <nav class="contents">
      <RouterLink to="/" :class="buttonClass('Home')">
        <House class="size-6" />
      </RouterLink>

      <RouterLink to="/explore" :class="buttonClass('Explore')">
        <Search class="size-6" />
      </RouterLink>

      <RouterLink v-if="wallet.loggedIn.value" to="/notifications" :class="cn(buttonClass('Notifications'), 'relative')">
        <NotificationsCount class="absolute top-1 left-6"/>
        <Bell class="size-6" />
      </RouterLink>

      <RouterLink v-if="wallet.loggedIn.value" :to="`/profile/${wallet.address.value}`" :class="buttonClass('Profile')">
        <User class="size-6" />
      </RouterLink>

      <RouterLink v-if="wallet.loggedIn.value" to="/settings" :class="buttonClass('Settings')">
        <Settings class="size-6" />
      </RouterLink>
    </nav>

    <button v-if="wallet.loggedIn.value" :class="buttonClass()" @click="popups.show('newPost', {})">
      <Feather class="size-6" />
    </button>
  </header>

</template>
