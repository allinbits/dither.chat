<script setup lang="ts">
import { Bell, Feather, House, Settings, User } from 'lucide-vue-next';

import { usePopups } from '@/composables/usePopups';
import { useWallet } from '@/composables/useWallet';

import NotificationsCount from '@/components/notifications/NotificationsCount.vue';
const wallet = useWallet();
const popups = usePopups();
</script>

<template>
  <div class="h-full w-full flex flex-row items-center border-t bg-background px-4">
    <RouterLink to="/" class="flex flex-1 justify-center">
      <House class="size-7" />
    </RouterLink>

    <nav v-if="wallet.loggedIn.value" class="contents h-full w-full">
      <RouterLink to="/" class="flex flex-1 justify-center">
        <div class="flex items-center  justify-center h-[52px]">
          <House class="size-6" />
        </div>
      </RouterLink>

      <RouterLink to="/notifications" class="flex relative flex-1 justify-center">
        <div class="flex items-center relative justify-center h-[52px]">
          <NotificationsCount class="absolute top-1 left-3"/>
          <Bell class="size-6" />
        </div>
      </RouterLink>

      <RouterLink :to="`/profile/${wallet.address.value}`" class="flex flex-1 justify-center">
        <div class="flex items-center  justify-center h-[52px]">
          <User class="size-6" />
        </div>
      </RouterLink>

      <button class="flex flex-1 justify-center" @click="popups.show('newPost', {})">
        <Feather class="size-7" />
      </button>
      <RouterLink to="/settings" class="flex flex-1 justify-center">
        <Settings class="size-7" />
      </RouterLink>
    </nav>
    <button class="flex flex-1 justify-center" @click="popups.show('newPost', {})">
      <div class="flex items-center  justify-center h-[52px]">
        <Feather class="size-6" />
      </div>
    </button>
  </div>

</template>
