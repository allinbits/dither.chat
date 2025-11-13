<script lang="ts" setup>
import { MoreVertical } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverTrigger,
} from '@/components/ui/popover';
import UserAvatarUsername from '@/components/users/UserAvatarUsername.vue';
import { useWallet } from '@/composables/useWallet';
import { useWalletDialogStore } from '@/stores/useWalletDialogStore';

import WalletConnectPopoverContent from './WalletConnectPopoverContent.vue';

const isConnecting = ref(false);
const isError = ref(false);

const { address, loggedIn } = useWallet();
const walletDialogStore = useWalletDialogStore();

const connectedState = computed(() => !isConnecting.value && loggedIn.value && !isError.value);
</script>

<template>
  <div class="w-full">
    <!-- Normal signed in account display -->
    <template v-if="connectedState">
      <div class="flex w-full items-center gap-2.5 rounded-md px-3 py-2 hover:bg-accent/50 transition-colors">
        <RouterLink
          :to="`/profile/${address}`"
          class="flex flex-1 items-center gap-2.5 active:opacity-70 transition-opacity"
        >
          <UserAvatarUsername :user-address="address" size="sm" disabled />
        </RouterLink>

        <Popover>
          <PopoverTrigger class="p-1 rounded hover:bg-accent/70 active:bg-accent transition-colors shrink-0">
            <MoreVertical class="size-4 text-muted-foreground" />
          </PopoverTrigger>
          <WalletConnectPopoverContent />
        </Popover>
      </div>
    </template>

    <template v-else>
      <Button class="w-full" @click="walletDialogStore.showDialog">
        {{ $t('components.WalletConnect.button') }}
      </Button>
    </template>
  </div>
</template>
