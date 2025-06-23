<script setup lang="ts">
import { Bell, Feather, House, Search, Settings, User } from 'lucide-vue-next';

import { usePopups } from '@/composables/usePopups';
import { useWallet } from '@/composables/useWallet';

import NotificationsCount from '@/components/notifications/NotificationsCount.vue';
import WalletConnect from '@/components/wallet/WalletConnect.vue';
import { cn } from '@/utility';
const wallet = useWallet();
const popups = usePopups();
const buttonClass = 'flex justify-center items-center size-[52px] rounded-full active:bg-accent hover:bg-accent';
</script>

<template>
  <header class="flex flex-col justify-between h-full  items-end  py-6 px-3">
    <div class="flex flex-col items-center gap-3 ">
      <nav class="contents">
        <RouterLink to="/" :class="buttonClass">
          <House class="size-6" />
        </RouterLink>

        <RouterLink  to="/explore" :class="buttonClass">
          <Search class="size-6" />
        </RouterLink>

        <RouterLink v-if="wallet.loggedIn.value"  to="/notifications" :class="cn(buttonClass, 'relative')">
          <NotificationsCount class="absolute top-1 left-6"/>
          <Bell class="size-6" />
        </RouterLink>

        <RouterLink v-if="wallet.loggedIn.value"  :to="`/profile/${wallet.address.value}`" :class="buttonClass">
          <User class="size-6" />
        </RouterLink>

        <RouterLink v-if="wallet.loggedIn.value"  to="/settings" :class="buttonClass">
          <Settings class="size-6" />
        </RouterLink>
      </nav>

      <button v-if="wallet.loggedIn.value" :class="buttonClass" @click="popups.show('newPost', {})">
        <Feather class="size-6" />
      </button>
    </div>

    <WalletConnect/>
  </header>
</template>
