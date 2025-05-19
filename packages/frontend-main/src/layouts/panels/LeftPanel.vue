<script setup lang="ts">

import { Bell, FlaskConical, House, User } from 'lucide-vue-next';

import { usePopovers } from '@/composables/usePopovers';
import { useWallet } from '@/composables/useWallet';

import LikePostPopup from '@/components/popups/LikePost.vue';
import NewPostPopup from '@/components/popups/NewPost.vue';
import Button from '@/components/ui/button/Button.vue';
import WalletConnect from '@/components/wallet/WalletConnect.vue';

const wallet = useWallet();
const popovers = usePopovers();

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

          <RouterLink
            to="/post?hash=9c0f718289998024ce7c83b24f350e3fc4fa0c3d5c421c5042422c8721eec3e0"
            class="flex flex-row items-center gap-3"
          >
            <div class="flex items-center justify-center h-[52px]">
              <FlaskConical class="size-7" />
            </div>
            <span class="hidden xl:inline text-lg font-medium">Post #1</span>
          </RouterLink>
        </div>
      </nav>

      <Button class="w-[207px] xl:inline hidden" @click="popovers.show('post', {})" v-if="wallet.loggedIn.value">New post</Button>
      <WalletConnect />
      <LikePostPopup />
      <NewPostPopup />
    </div>

    <div>Stuff here?</div>
  </header>
</template>
