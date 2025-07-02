<script lang="ts" setup>

import { computed, ref } from 'vue';

import { useWallet } from '@/composables/useWallet';

import WalletConnectPopoverContent from './WalletConnectPopoverContent.vue';

import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverTrigger,
} from '@/components/ui/popover';
import UserAvatarUsername from '@/components/users/UserAvatarUsername.vue';
import { useWalletDialogStore } from '@/stores/useWalletDialogStore';

const isConnecting = ref(false);
const isError = ref(false);

const { address, loggedIn } = useWallet();
const walletDialogStore = useWalletDialogStore();

const connectedState = computed(() => !isConnecting.value && loggedIn.value && !isError.value);

</script>

<template>
  <div>
    <!-- Normal signed in account display -->
    <template v-if="connectedState">
      <Popover>
        <PopoverTrigger class="w-full">
          <UserAvatarUsername :userAddress="address" disabled class="h-[52px] px-4 gap-3 rounded-sm hover:bg-accent active:bg-accent transition-[background-color]"/>
        </PopoverTrigger>

        <WalletConnectPopoverContent/>
      </Popover>
    </template>

    <template v-else>
      <Button @click="walletDialogStore.showDialog" class="w-[207px]">
        {{ $t('components.WalletConnect.button') }}
      </Button>
    </template>
  </div>
</template>
