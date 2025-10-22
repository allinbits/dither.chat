<script lang="ts" setup>
import { Wallet } from 'lucide-vue-next';
import { computed, ref } from 'vue';

import {
  Popover,
  PopoverTrigger,
} from '@/components/ui/popover';
import UserAvatar from '@/components/users/UserAvatar.vue';
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
  <div class="size-[40px]">
    <!-- Normal signed in account display -->
    <template v-if="connectedState">
      <Popover>
        <PopoverTrigger class="size-full flex justify-center items-center">
          <UserAvatar :user-address="address" disabled />
        </PopoverTrigger>

        <WalletConnectPopoverContent />
      </Popover>
    </template>

    <template v-else>
      <button class="flex items-center justify-center flex-row size-full rounded-full hover:bg-accent active:bg-accent transition-colors" @click="walletDialogStore.showDialog">
        <Wallet class="size-6" />
      </button>
    </template>
  </div>
</template>
