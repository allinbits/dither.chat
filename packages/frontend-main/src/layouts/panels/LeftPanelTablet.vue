<script setup lang="ts">
import { computed } from 'vue';
import { type RouteRecordNameGeneric, useRouter } from 'vue-router';
import { Bell, Feather, House, Search, Settings, User } from 'lucide-vue-next';

import { usePopups } from '@/composables/usePopups';
import { useWallet } from '@/composables/useWallet';

import NotificationsCount from '@/components/notifications/NotificationsCount.vue';
import WalletConnectButtonMobile from '@/components/wallet/WalletConnectButton/WalletConnectButtonMobile.vue';
import { routesNames } from '@/router';
import { cn } from '@/utility';
const wallet = useWallet();
const popups = usePopups();
const router = useRouter();
const isMyProfileRoute = computed(() => router.currentRoute.value.name?.toString().startsWith(routesNames.profile) && wallet.loggedIn.value && wallet.address.value === router.currentRoute.value.params.address);
const buttonClass = (routeName?: RouteRecordNameGeneric) => `flex justify-center items-center size-[52px] rounded-full active:bg-accent hover:bg-accent transition-colors ${!!routeName && router.currentRoute.value.name?.toString().startsWith(routeName.toString()) && 'bg-accent/80'}`;

</script>

<template>
  <header class="flex flex-col justify-between h-full  items-end  py-6 px-3">
    <div class="flex flex-col items-center gap-3 ">
      <nav class="contents">
        <RouterLink to="/" :class="buttonClass(routesNames.home)">
          <House class="size-6" />
        </RouterLink>

        <RouterLink  to="/explore" :class="buttonClass(routesNames.explore)">
          <Search class="size-6" />
        </RouterLink>

        <RouterLink v-if="wallet.loggedIn.value"  to="/notifications" :class="cn(buttonClass(routesNames.notifications), 'relative')">
          <NotificationsCount class="absolute top-1 left-6"/>
          <Bell class="size-6" />
        </RouterLink>

        <RouterLink v-if="wallet.loggedIn.value"  :to="`/profile/${wallet.address.value}`" :class="buttonClass(isMyProfileRoute ? routesNames.profile : undefined)">
          <User class="size-6" />
        </RouterLink>

        <RouterLink v-if="wallet.loggedIn.value"  to="/settings" :class="buttonClass(routesNames.settings)">
          <Settings class="size-6" />
        </RouterLink>
      </nav>

      <button v-if="wallet.loggedIn.value" :class="buttonClass()" @click="popups.show('newPost', {})">
        <Feather class="size-6" />
      </button>
    </div>

    <WalletConnectButtonMobile/>
  </header>
</template>
