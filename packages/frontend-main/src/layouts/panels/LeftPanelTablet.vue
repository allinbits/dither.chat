<script setup lang="ts">
import type { RouteRecordNameGeneric } from 'vue-router';

import { Bell, Feather, HelpCircle, House, Search, Settings, User } from 'lucide-vue-next';
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import NotificationsCount from '@/components/notifications/NotificationsCount.vue';
import { Button, buttonVariants } from '@/components/ui/button';
import WalletConnectButtonMobile from '@/components/wallet/WalletConnectButton/WalletConnectButtonMobile.vue';
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

function isRouteActive(routeName?: RouteRecordNameGeneric) {
  return !!routeName && router.currentRoute.value.name?.toString().startsWith(routeName.toString());
}
</script>

<template>
  <header class="flex flex-col justify-between h-full items-end py-6 px-3">
    <div class="flex flex-col items-center gap-3">
      <nav class="contents">
        <RouterLink
          to="/"
          :class="cn(buttonVariants({ variant: 'icon', size: 'iconMd' }), isRouteActive(routesNames.home) && 'bg-accent/80')"
        >
          <House class="size-6" />
        </RouterLink>

        <RouterLink
          to="/explore"
          :class="cn(buttonVariants({ variant: 'icon', size: 'iconMd' }), isRouteActive(routesNames.explore) && 'bg-accent/80')"
        >
          <Search class="size-6" />
        </RouterLink>

        <RouterLink
          v-if="wallet.loggedIn.value"
          to="/notifications"
          :class="cn(buttonVariants({ variant: 'icon', size: 'iconMd' }), 'relative', isRouteActive(routesNames.notifications) && 'bg-accent/80')"
        >
          <NotificationsCount class="absolute top-1 left-6" />
          <Bell class="size-6" />
        </RouterLink>

        <RouterLink
          v-if="wallet.loggedIn.value"
          :to="`/profile/${wallet.address.value}`"
          :class="cn(buttonVariants({ variant: 'icon', size: 'iconMd' }), isMyProfileRoute && 'bg-accent/80')"
        >
          <User class="size-6" />
        </RouterLink>

        <RouterLink
          v-if="wallet.loggedIn.value"
          to="/settings"
          :class="cn(buttonVariants({ variant: 'icon', size: 'iconMd' }), isRouteActive(routesNames.settings) && 'bg-accent/80')"
        >
          <Settings class="size-6" />
        </RouterLink>

        <RouterLink
          to="/about"
          :class="cn(buttonVariants({ variant: 'icon', size: 'iconMd' }), isRouteActive(routesNames.about) && 'bg-accent/80')"
        >
          <HelpCircle class="size-6" />
        </RouterLink>
      </nav>

      <Button
        v-if="wallet.loggedIn.value"
        variant="icon"
        size="iconMd"
        @click="isDefaultAmountInvalid ? popups.show('invalidDefaultAmount', 'none') : popups.show('newPost', {})"
      >
        <Feather class="size-6" />
      </Button>
    </div>

    <WalletConnectButtonMobile class="size-[52px]" />
  </header>
</template>
