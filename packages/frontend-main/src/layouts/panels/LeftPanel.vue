<script setup lang="ts">
import type { RouteRecordNameGeneric } from 'vue-router';

import { Bell, Feather, HelpCircle, House, Search, Settings, User } from 'lucide-vue-next';
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import NotificationsCount from '@/components/notifications/NotificationsCount.vue';
import { Button, buttonVariants } from '@/components/ui/button';
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
  <header class="flex flex-col justify-between h-full max-w-[270px] ml-auto pt-6 pb-6 pr-6">
    <div class="flex flex-col gap-8">
      <nav class="contents">
        <RouterLink to="/" :class="cn(buttonVariants({ variant: 'navigation', size: 'nav' }), 'w-full')">
          <span class="text-xl font-semibold tracking-tight logo">
            dither
          </span>
        </RouterLink>

        <div class="flex flex-col gap-1">
          <RouterLink
            to="/"
            :class="cn(buttonVariants({ variant: 'navigation', size: 'nav' }), 'w-full', isRouteActive(routesNames.home) && 'bg-muted/60')"
          >
            <House class="size-5" />
            <span class="text-base font-semibold">Home</span>
          </RouterLink>

          <RouterLink
            to="/explore"
            :class="cn(buttonVariants({ variant: 'navigation', size: 'nav' }), 'w-full', isRouteActive(routesNames.explore) && 'bg-muted/60')"
          >
            <Search class="size-5" />
            <span class="text-base font-semibold">Explore</span>
          </RouterLink>

          <RouterLink
            v-if="wallet.loggedIn.value"
            to="/notifications"
            :class="cn(buttonVariants({ variant: 'navigation', size: 'nav' }), 'w-full relative', isRouteActive(routesNames.notifications) && 'bg-muted/60')"
          >
            <NotificationsCount class="absolute top-0.5 left-5" />
            <Bell class="size-5" />
            <span class="text-base font-semibold">Notifications</span>
          </RouterLink>

          <RouterLink
            v-if="wallet.loggedIn.value"
            :to="`/profile/${wallet.address.value}`"
            :class="cn(buttonVariants({ variant: 'navigation', size: 'nav' }), 'w-full', isMyProfileRoute && 'bg-muted/60')"
          >
            <User class="size-5" />
            <span class="text-base font-semibold">My Profile</span>
          </RouterLink>
        </div>

        <Button
          v-if="wallet.loggedIn.value"
          variant="elevated"
          size="sm"
          class="w-full justify-start font-bold"
          @click="isDefaultAmountInvalid ? popups.show('invalidDefaultAmount', 'none') : popups.show('newPost', {})"
        >
          <Feather class="size-5" />
          {{ $t('components.Button.newPost') }}
        </Button>

        <div class="flex flex-col gap-1 pt-2 border-t border-border/40">
          <RouterLink
            v-if="wallet.loggedIn.value"
            to="/settings"
            :class="cn(buttonVariants({ variant: 'navigation', size: 'nav' }), 'w-full', isRouteActive(routesNames.settings) && 'bg-muted/60')"
          >
            <Settings class="size-4 opacity-50" />
            <span class="text-base font-semibold opacity-60">Settings</span>
          </RouterLink>

          <RouterLink
            to="/about"
            :class="cn(buttonVariants({ variant: 'navigation', size: 'nav' }), 'w-full', isRouteActive(routesNames.about) && 'bg-muted/60')"
          >
            <HelpCircle class="size-4 opacity-50" />
            <span class="text-base font-semibold opacity-60">About</span>
          </RouterLink>
        </div>
      </nav>
    </div>
  </header>
</template>
