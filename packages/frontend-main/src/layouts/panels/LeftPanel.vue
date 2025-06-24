<script setup lang="ts">
import { Bell, House, Search, Settings, User } from 'lucide-vue-next';

import { usePopups } from '@/composables/usePopups';
import { useWallet } from '@/composables/useWallet';

import NotificationsCount from '@/components/notifications/NotificationsCount.vue';
import { Button } from '@/components/ui/button';
import WalletConnect from '@/components/wallet/WalletConnect.vue';
import { cn } from '@/utility';

const wallet = useWallet();
const popups = usePopups();
const buttonClass = 'flex flex-row items-center h-[52px] gap-3 hover:underline';
const buttonLabelClass = 'text-lg font-semibold';
</script>

<template>
  <!-- TODO: Adjust style, buttons, etc -->
  <header class="flex flex-col justify-between h-full max-w-[256px] ml-auto py-6">
    <div class="flex flex-col gap-22">

      <nav class="contents">
        <RouterLink to="/">
          <span class="text-2xl font-semibold hover:underline">
            Dither
          </span>
        </RouterLink>

        <div class="flex flex-col gap-3">
          <RouterLink to="/" :class="buttonClass">
            <House class="size-6" />
            <span :class="buttonLabelClass">Home</span>
          </RouterLink>

          <RouterLink to="/explore" :class="buttonClass">
            <Search class="size-6" />
            <span :class="buttonLabelClass">Explore</span>
          </RouterLink>

          <RouterLink v-if="wallet.loggedIn.value" to="/notifications" :class="cn(buttonClass, 'relative')">
            <NotificationsCount class="absolute top-1 left-3"/>
            <Bell class="size-6" />
            <span :class="buttonLabelClass">Notifications</span>
          </RouterLink>

          <RouterLink
            v-if="wallet.loggedIn.value"
            :to="`/profile/${wallet.address.value}`"
            :class="buttonClass"
          >
            <User class="size-6" />
            <span :class="buttonLabelClass">My Profile</span>
          </RouterLink>

          <RouterLink
            v-if="wallet.loggedIn.value"
            :to="`/settings`"
            :class="buttonClass"
          >
            <Settings class="size-6" />
            <span :class="buttonLabelClass">Settings</span>
          </RouterLink>
        </div>
      </nav>

      <Button class="w-[207px]" @click="popups.show('newPost', {})" v-if="wallet.loggedIn.value">
        {{ $t('components.Button.newPost') }}
      </Button>
    </div>

    <WalletConnect/>
  </header>
</template>
