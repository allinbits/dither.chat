<script setup lang="ts">
import { computed } from 'vue';
import { type RouteRecordNameGeneric, useRouter } from 'vue-router';
import { Bell, House, Search, Settings, User } from 'lucide-vue-next';

import { usePopups } from '@/composables/usePopups';
import { useWallet } from '@/composables/useWallet';

import NotificationsCount from '@/components/notifications/NotificationsCount.vue';
import { Button } from '@/components/ui/button';
import WalletConnectButton from '@/components/wallet/WalletConnectButton/WalletConnectButton.vue';
import { routesNames } from '@/router';
import { cn } from '@/utility';

const wallet = useWallet();
const popups = usePopups();
const router = useRouter();
const isMyProfileRoute = computed(() => router.currentRoute.value.name?.toString().startsWith(routesNames.profile) && wallet.loggedIn.value && wallet.address.value === router.currentRoute.value.params.address);
const buttonClass = (routeName?: RouteRecordNameGeneric) => `flex items-center flex-row h-[52px] px-4 gap-3 rounded-sm hover:bg-accent active:bg-accent transition-colors ${!!routeName && router.currentRoute.value.name?.toString().startsWith(routeName.toString()) && 'bg-accent/60'}`;
const buttonLabelClass = 'text-lg font-semibold';
</script>

<template>
  <header class="flex flex-col justify-between h-full max-w-[270px] ml-auto pt-5 pb-6 pr-6">
    <div class="flex flex-col gap-22">

      <nav class="contents">
        <RouterLink to="/" :class="buttonClass()">
          <span class="text-2xl font-semibold">
            Dither
          </span>
        </RouterLink>

        <div class="flex flex-col gap-3">
          <RouterLink to="/" :class="buttonClass(routesNames.home)">
            <House class="size-6"  />
            <span :class="buttonLabelClass">Home</span>
          </RouterLink>

          <RouterLink to="/explore" :class="buttonClass(routesNames.explore)">
            <Search class="size-6" />
            <span :class="buttonLabelClass">Explore</span>
          </RouterLink>

          <RouterLink v-if="wallet.loggedIn.value" to="/notifications" :class="cn(buttonClass(routesNames.notifications), 'relative')">
            <NotificationsCount class="absolute top-1 left-6"/>
            <Bell class="size-6" />
            <span :class="buttonLabelClass">Notifications</span>
          </RouterLink>

          <RouterLink
            v-if="wallet.loggedIn.value"
            :to="`/profile/${wallet.address.value}`"
            :class="buttonClass(isMyProfileRoute ? routesNames.profile : undefined)"
          >
            <User class="size-6" />
            <span :class="buttonLabelClass">My Profile</span>
          </RouterLink>

          <RouterLink
            v-if="wallet.loggedIn.value"
            :to="`/settings`"
            :class="buttonClass(routesNames.settings)"
          >
            <Settings class="size-6" />
            <span :class="buttonLabelClass">Settings</span>
          </RouterLink>
        </div>
      </nav>

      <Button class="ml-4 w-[208px]" @click="popups.show('newPost', {})" v-if="wallet.loggedIn.value">
        {{ $t('components.Button.newPost') }}
      </Button>
    </div>

    <WalletConnectButton/>
  </header>
</template>
