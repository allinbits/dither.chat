<script setup lang="ts">
import { Bell, Feather, House, Settings, User } from 'lucide-vue-next';

import { usePopups } from '@/composables/usePopups';
import { useWallet } from '@/composables/useWallet';
const wallet = useWallet();
const popups = usePopups();
</script>

<template>
  <div class="h-full w-full flex flex-row items-center border-t bg-background px-4">

    <nav v-if="wallet.loggedIn.value" class="contents h-full w-full">
      <RouterLink to="/" class="flex flex-1 justify-center">
        <House class="size-7" />
      </RouterLink>

      <RouterLink to="/notifications" class="flex flex-1 justify-center">
        <Bell class="size-7" />
      </RouterLink>

      <RouterLink :to="`/profile/${wallet.address.value}`" class="flex flex-1 justify-center">
        <User class="size-7" />
      </RouterLink>

      <RouterLink to="/settings" class="flex flex-1 justify-center">
        <Settings class="size-7" />
      </RouterLink>

    </nav>

    <button class="flex flex-1 justify-center" @click="popups.show('newPost', {})">
      <Feather class="size-7" />
    </button>

  </div>

</template>
