<script setup lang="ts">
import { Bell, Feather, House, User } from 'lucide-vue-next';

import { useNotificationsCount } from '@/composables/useNotificationsCount';
import { usePopups } from '@/composables/usePopups';
import { useWallet } from '@/composables/useWallet';
const wallet = useWallet();
const popups = usePopups();
const { data: notificationsCount } = useNotificationsCount({ userAddress: wallet.address });
</script>

<template>
  <div class="h-full w-full flex flex-row items-center border-t bg-background px-4">

    <nav v-if="wallet.loggedIn.value" class="contents h-full w-full">
      <RouterLink to="/" class="flex flex-1 justify-center">
        <div class="flex items-center  justify-center h-[52px]">
          <House class="size-6" />
        </div>
      </RouterLink>

      <RouterLink to="/notifications" class="flex relative flex-1 justify-center">
        <div class="flex items-center relative justify-center h-[52px]">
          <div v-if="!!notificationsCount" class="flex items-center justify-center absolute top-1 left-3 h-[18px] min-w-[18px] px-1 rounded-full bg-red-500 border-1 border-background text-white text-xs font-medium  ">
            {{ notificationsCount }}
          </div>
          <Bell class="size-6" />
        </div>
      </RouterLink>

      <RouterLink :to="`/profile/${wallet.address.value}`" class="flex flex-1 justify-center">
        <div class="flex items-center  justify-center h-[52px]">
          <User class="size-6" />
        </div>
      </RouterLink>

    </nav>

    <button class="flex flex-1 justify-center" @click="popups.show('newPost', {})">
      <div class="flex items-center  justify-center h-[52px]">
        <Feather class="size-6" />
      </div>
    </button>

  </div>

</template>
