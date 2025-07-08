<script lang="ts" setup>

import { computed, ref } from 'vue';
import { Wallet } from 'lucide-vue-next';

import { useWallet } from '@/composables/useWallet';

import WalletConnectPopoverContent from './WalletConnectPopoverContent.vue';

import {
    Popover,
    PopoverTrigger,
} from '@/components/ui/popover';
import UserAvatar from '@/components/users/UserAvatar.vue';
import { useWalletDialogStore } from '@/stores/useWalletDialogStore';

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
          <UserAvatar :userAddress="address" disabled/>
        </PopoverTrigger>

        <WalletConnectPopoverContent/>
      </Popover>
    </template>

    <template v-else>
      <button @click="walletDialogStore.showDialog" class="flex items-center justify-center flex-row size-full rounded-full hover:bg-accent active:bg-accent transition-colors">
        <Wallet class="size-6" />
      </button>
    </template>
  </div>
</template>
