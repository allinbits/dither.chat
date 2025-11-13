<script setup lang="ts">
import type { RouteRecordNameGeneric } from 'vue-router';

import { Bell, Feather, HelpCircle, House, Search, Settings, User } from 'lucide-vue-next';
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
function buttonClass(routeName?: RouteRecordNameGeneric, isTwoLine?: boolean) {
  const isActive = !!routeName && router.currentRoute.value.name?.toString().startsWith(routeName.toString());
  return `flex items-center flex-row ${isTwoLine ? 'h-auto min-h-11 py-2' : 'h-11'} px-3 gap-2.5 rounded-md hover:bg-accent/50 active:bg-accent transition-colors ${isActive && 'bg-muted/60'}`;
}
const buttonLabelClass = 'text-base font-semibold';
</script>

<template>
  <header class="flex flex-col justify-between h-full max-w-[270px] ml-auto pt-6 pb-6 pr-6">
    <div class="flex flex-col gap-8">
      <nav class="contents">
        <RouterLink to="/" :class="buttonClass()">
          <span class="text-xl font-semibold tracking-tight logo">
            dither
          </span>
        </RouterLink>

        <div class="flex flex-col gap-1">
          <RouterLink to="/" :class="buttonClass(routesNames.home)">
            <House class="size-5" />
            <span :class="buttonLabelClass">Home</span>
          </RouterLink>

          <RouterLink to="/explore" :class="buttonClass(routesNames.explore)">
            <Search class="size-5" />
            <span :class="buttonLabelClass">Explore</span>
          </RouterLink>

          <RouterLink v-if="wallet.loggedIn.value" to="/notifications" :class="cn(buttonClass(routesNames.notifications), 'relative')">
            <NotificationsCount class="absolute top-0.5 left-5" />
            <Bell class="size-5" />
            <span :class="buttonLabelClass">Notifications</span>
          </RouterLink>

          <RouterLink
            v-if="wallet.loggedIn.value"
            :to="`/profile/${wallet.address.value}`"
            :class="buttonClass(isMyProfileRoute ? routesNames.profile : undefined)"
          >
            <User class="size-5" />
            <span :class="buttonLabelClass">My Profile</span>
          </RouterLink>
        </div>

        <button
          v-if="wallet.loggedIn.value"
          class="flex items-center flex-row h-11 px-3 gap-2.5 rounded-md border border-border/70 bg-background/60 backdrop-blur-sm shadow-[0_1px_3px_0_rgba(0,0,0,0.08)] hover:border-border hover:bg-background/85 hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.12)] active:bg-background/95 active:shadow-[0_1px_2px_0_rgba(0,0,0,0.08)] transition-all duration-200"
          @click="isDefaultAmountInvalid ? popups.show('invalidDefaultAmount', 'none') : popups.show('newPost', {})"
        >
          <Feather class="size-5" />
          <span class="text-base font-bold">{{ $t('components.Button.newPost') }}</span>
        </button>

        <div class="flex flex-col gap-1 pt-2 border-t border-border/40">
          <RouterLink
            v-if="wallet.loggedIn.value"
            to="/settings"
            :class="buttonClass(routesNames.settings)"
          >
            <Settings class="size-4 opacity-50" />
            <span :class="cn(buttonLabelClass, 'opacity-60')">Settings</span>
          </RouterLink>

          <RouterLink
            to="/about"
            :class="buttonClass(routesNames.about)"
          >
            <HelpCircle class="size-4 opacity-50" />
            <span :class="cn(buttonLabelClass, 'opacity-60')">About</span>
          </RouterLink>
        </div>
      </nav>
    </div>
  </header>
</template>
