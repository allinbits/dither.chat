<script setup lang="ts">
import { Bell, Feather, House, Search, User } from 'lucide-vue-next';

import { usePopups } from '@/composables/usePopups';
import { useWallet } from '@/composables/useWallet';

import { Button } from '@/components/ui/button';
import WalletConnect from '@/components/wallet/WalletConnect.vue';

const wallet = useWallet();
const popups = usePopups();
</script>

<template>
  <!-- TODO: Adjust style, buttons, etc -->
  <header class="flex flex-col justify-between h-full w-full py-6 pl-6 pr-4">
    <div class="flex flex-col justify-between gap-3 xl:gap-22 w-full xl:items-start items-end">
      <span class="hidden xl:inline text-2xl font-semibold hover:underline">
        <RouterLink to="/">Dither</RouterLink></span
      >

      <nav class="contents xl:flex flex-col gap-3">
        <RouterLink to="/" class="flex flex-row items-center gap-3 hover:underline">
          <div class="flex items-center justify-center h-[52px]">
            <House class="size-6" />
          </div>
          <span class="hidden xl:inline text-lg font-semibold">Home</span>
        </RouterLink>
        <RouterLink to="/explore" class="flex flex-row items-center gap-3 hover:underline">
          <div class="flex items-center justify-center h-[52px]">
            <Search class="size-6" />
          </div>
          <span class="hidden xl:inline text-lg font-semibold">Explore</span>
        </RouterLink>
        <template v-if="wallet.loggedIn.value">
          <RouterLink to="/notifications" class="flex flex-row items-center gap-3 hover:underline">
            <div class="flex items-center justify-center h-[52px]">
              <Bell class="size-6" />
            </div>
            <span class="hidden xl:inline text-lg font-semibold">Notifications</span>
          </RouterLink>

          <RouterLink
            :to="`/profile/${wallet.address.value}`"
            class="flex flex-row items-center gap-3 hover:underline"
          >
            <div class="flex items-center justify-center h-[52px]">
              <User class="size-6" />
            </div>
            <span class="hidden xl:inline text-lg font-semibold">My Profile</span>
          </RouterLink>
        </template>
      </nav>

      <Button class="w-[207px] xl:inline hidden" @click="popups.show('newPost', {})" v-if="wallet.loggedIn.value">
        {{ $t('components.Button.newPost') }}
      </Button>
      <button class="h-[52px] xl:hidden inline" @click="popups.show('newPost', {})" v-if="wallet.loggedIn.value">
        <Feather class="size-7" />
      </button>
    </div>

    <WalletConnect class="self-end xl:self-start" />
  </header>
</template>
