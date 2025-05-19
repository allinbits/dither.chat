<script setup lang="ts">

import { Bell, House, User } from 'lucide-vue-next';

import { usePopups } from '@/composables/usePopups';
import { useWallet } from '@/composables/useWallet';

import DislikePostDialog from '@/components/popups/DislikePostDialog.vue';
import LikePostDialog from '@/components/popups/LikePostDialog.vue';
import NewPostDialog from '@/components/popups/NewPostDialog.vue';
import { Button } from '@/components/ui/button';
import WalletConnect from '@/components/wallet/WalletConnect.vue';

const wallet = useWallet();
const popovers = usePopups();

</script>

<template>
  <!-- TODO: Adjust style, buttons, etc -->
  <header class="flex flex-col justify-between h-full w-full">
    <div class="flex flex-col justify-between gap-22 w-full xl:items-start items-end">
      <nav class="flex flex-col gap-20">
        <RouterLink
          to="/"
          class="h-[52px]"
        >
          <span class="hidden xl:inline  text-2xl font-semibold">Dither</span>
        </RouterLink>

        <div class="flex flex-col gap-3">
          <RouterLink
            to="/"
            class="flex flex-row items-center gap-3"
          >
            <div class="flex items-center justify-center h-[52px]">
              <House class="size-7" />
            </div>
            <span class="hidden xl:inline text-lg font-medium">Home</span>
          </RouterLink>

          <RouterLink
            to="/notifications"
            class="flex flex-row items-center gap-3"
          >
            <div class="flex items-center justify-center h-[52px]">
              <Bell class="size-7" />
            </div>
            <span class="hidden xl:inline text-lg font-medium">Notifications</span>
          </RouterLink>

          <RouterLink
            to="/profile/:address"
            class="flex flex-row items-center gap-3"
          >
            <div class="flex items-center justify-center h-[52px]">
              <User class="size-7" />
            </div>
            <span class="hidden xl:inline text-lg font-medium">My Profile</span>
          </RouterLink>
        </div>
      </nav>

      <Button class="w-[207px] xl:inline hidden" @click="popovers.show('newPost', {})" v-if="wallet.loggedIn.value">New post</Button>
      <WalletConnect />

      <LikePostDialog />
      <DislikePostDialog />
      <NewPostDialog />
    </div>

    <div>Stuff here?</div>
  </header>
</template>
